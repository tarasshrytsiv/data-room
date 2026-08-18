'use client'

import useSWR from 'swr'
import Link from 'next/link'
import type { ShareDto } from '@repo/types'

type ShareWithMeta = ShareDto & {
  sharedBy: { email: string }
  dataRoom: { name: string } | null
  folder: { name: string } | null
  file: { name: string } | null
}

export default function SharedWithMePage() {
  const { data: shares } = useSWR<ShareWithMeta[]>('/shares/with-me')

  function resourceLabel(share: ShareWithMeta) {
    if (share.dataRoom) return share.dataRoom.name
    if (share.folder) return share.folder.name
    if (share.file) return share.file.name
    return '—'
  }

  function resourceKind(share: ShareWithMeta) {
    if (share.dataRoomId) return 'Data Room'
    if (share.folderId) return 'Folder'
    return 'File'
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] mb-8">Shared with me</h1>

      {!shares || shares.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Nothing shared with you yet</p>
      ) : (
        <div className="space-y-3">
          {shares.map((share) => (
            <Link
              key={share.id}
              href={`/shared/${share.token}`}
              className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-[var(--color-muted)] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">{resourceLabel(share)}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  {resourceKind(share)} · {share.role}
                </p>
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">{share.sharedBy.email}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
