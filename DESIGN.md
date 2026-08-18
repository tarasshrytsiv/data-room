# Data Room — Design Notes

## Data Model (ERD)

```
┌─────────────┐        ┌──────────────┐        ┌────────────┐
│    User     │        │   DataRoom   │        │   Folder   │
│─────────────│        │──────────────│        │────────────│
│ id (PK)     │──┐     │ id (PK)      │──┐     │ id (PK)    │
│ email       │  │1    │ name         │  │1    │ name       │
│ name        │  └────▶│ ownerId (FK) │  └────▶│ dataRoomId │◀─┐
│ image       │        │ createdAt    │        │ parentId   │──┘ self-ref
└─────────────┘        │ updatedAt    │        │ createdAt  │
                       └──────────────┘        └────────────┘
                                                      │1
                                                      ▼
                                               ┌────────────┐       ┌─────────────┐
                                               │    File    │──────▶│ FileVersion │
                                               │────────────│  1:N  │─────────────│
                                               │ id (PK)    │       │ id (PK)     │
                                               │ name       │       │ fileId (FK) │
                                               │ storageKey │       │ storageKey  │
                                               │ mimeType   │       │ size        │
                                               │ size       │       │ createdAt   │
                                               │ folderId   │       └─────────────┘
                                               └────────────┘

┌──────────────────────────────────────────────────────────────┐
│                           Share                              │
│──────────────────────────────────────────────────────────────│
│ id (PK)        token (unique)    type: PUBLIC|PERMISSIONED   │
│ role: VIEWER|EDITOR             expiresAt    revokedAt       │
│ sharedById (FK → User)          sharedWithId (FK → User)?   │
│ dataRoomId (FK)? │ folderId (FK)? │ fileId (FK)?            │
└──────────────────────────────────────────────────────────────┘
```

**Key constraints / indexes:**
- `Folder`: `@@index([dataRoomId])`, `@@index([parentId])`, `@@unique([parentId, name])`
- `File`: `@@index([folderId])`, `@@unique([folderId, name])`
- `Share`: `@@index([token])`, `@@index([sharedWithId])`
- Cascade deletes: removing a DataRoom removes all Folders → Files → Shares

---

## How It Scales

### 1. Total size and item count of a folder subtree

A single recursive CTE walks the folder tree and aggregates in one query:

```sql
WITH RECURSIVE subtree AS (
  SELECT id FROM "Folder" WHERE id = $folderId
  UNION ALL
  SELECT f.id FROM "Folder" f INNER JOIN subtree s ON f."parentId" = s.id
)
SELECT
  COALESCE(SUM(fi.size), 0) AS total_size,
  COUNT(fi.id)              AS item_count
FROM "File" fi
WHERE fi."folderId" IN (SELECT id FROM subtree)
```

The result is cached in Redis with a short TTL. The cache key is invalidated whenever a file is created, moved, replaced, or deleted in any folder inside that subtree — so subsequent reads are O(1) until the next mutation.

At very large scale (millions of files) the CTE can be replaced with a **materialized path** or **nested-set** model that makes subtree aggregation a simple range scan. Alternatively, a denormalized `subtree_size` counter column on `Folder`, updated via a database trigger on every file write, avoids the CTE entirely and keeps the read path O(1) with no cache.

---

### 2. 100,000 files in one Data Room

**Listing — cursor pagination instead of OFFSET:**
`GET /folders/:id/contents` accepts a `cursor` (last-seen `createdAt`) and `limit` (default 50). This keeps each page fetch O(log N) via the `folderId` index rather than scanning and discarding rows like OFFSET does.

**Indexes already in place:**
- `File.folderId` — covers `WHERE folderId = ?` (direct children listing)
- `Folder.dataRoomId` + `Folder.parentId` — covers tree traversal and root listing
- `File.(folderId, name)` unique index — O(log N) conflict check on upload

**What would need to change at 100 k+ files:**
- Add a full-text search index (PostgreSQL `tsvector` on `File.name`) or offload to a dedicated search service (Meilisearch / Typesense) — the current `ILIKE` search degrades to a sequential scan without it.
- Introduce `updatedAt`-based partial indexes for recently modified files to keep "recent activity" queries fast.
- Pre-aggregate folder stats in a background job rather than on-demand if the CTE becomes a bottleneck.

---

### 3. Per-user roles without remodeling

The `Share` table already carries a `role` column (`VIEWER | EDITOR`) and an optional `sharedWithId`. Adding more granular per-user permissions requires **no schema change** — only enforcement logic changes:

| What you want | How |
|---|---|
| Different roles per user | Create one `PERMISSIONED` Share per user with the desired `role` |
| Inherited permissions (room → folder → file) | When checking access, walk up: file share → folder share → room share, taking the most-specific role found |
| Revoke one user | Set `revokedAt` on that user's Share record |
| Public + per-user hybrid | Keep a `PUBLIC / VIEWER` share for the link and add `PERMISSIONED / EDITOR` shares for specific users |

To add new roles (e.g. `COMMENTER`, `DOWNLOADER`) only the `ShareRole` enum and the guard/middleware that reads it need updating — the data shape stays the same.

---

## AI Usage

Claude Code (claude-sonnet-4-6) was used as a pair-programming assistant throughout the build:

- **Scaffolding** — generated initial NestJS module/service/controller stubs and Next.js page structure given the schema as context.
- **Debugging** — diagnosed runtime errors (Supabase asymmetric JWT migration breaking `JwtService.verify`, Tailwind v3/v4 CSS incompatibilities, CORS preflight rejection for the custom `QUERY` method, Prisma client not generated on Railway CI).
- **Code generation** — wrote boilerplate-heavy pieces: Prisma upsert logic in guards, Redis cache invalidation, the recursive CTE for folder stats, SWR data-fetching hooks, and dialog components.
- **Review** — caught a server-component / client-component boundary violation (passing event handler functions as props across the boundary) and suggested the `ReadonlyItemGrid` wrapper fix.

All generated code was reviewed, tested locally, and adjusted before committing. Architecture decisions (data model, caching strategy, share design) were made by the developer; AI accelerated the implementation of those decisions.
