import {
  ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreateFolderDto } from './dto/create-folder.dto'
import { UpdateFolderDto } from './dto/update-folder.dto'
import { FolderContentsDto } from './dto/folder-contents.dto'

const STATS_TTL = 300

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findOne(id: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: { dataRoom: { select: { ownerId: true } } },
    })
    if (!folder) throw new NotFoundException()
    if (folder.dataRoom.ownerId !== userId) throw new ForbiddenException()
    return folder
  }

  async create(dto: CreateFolderDto, userId: string) {
    if (!dto.parentId) {
      const existing = await this.prisma.folder.findMany({
        where: { dataRoomId: dto.dataRoomId, parentId: null, name: dto.name },
      })
      if (existing.length > 0) throw new ConflictException('Folder name already exists at root level')
    }

    const folder = await this.prisma.folder.create({
      data: { name: dto.name, dataRoomId: dto.dataRoomId, parentId: dto.parentId ?? null },
    })

    await this.invalidateFolderStatsCache(folder.id)
    return folder
  }

  async getContents(id: string, userId: string, dto: FolderContentsDto) {
    await this.findOne(id, userId)

    const limit = dto.limit ?? 50
    const cursor = dto.cursor
      ? JSON.parse(Buffer.from(dto.cursor, 'base64').toString()) as { createdAt: string; id: string }
      : undefined

    const orderField = dto.sort === 'name' ? 'name' : 'createdAt'
    const orderDir = dto.order ?? 'asc'

    const [folders, files] = await Promise.all([
      dto.type !== 'file'
        ? this.prisma.folder.findMany({
            where: { parentId: id },
            orderBy: [{ [orderField]: orderDir }, { id: orderDir }],
          })
        : [],
      dto.type !== 'folder'
        ? this.prisma.file.findMany({
            where: { folderId: id },
            take: limit + 1,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor.id } : undefined,
            orderBy: [{ [orderField]: orderDir }, { id: orderDir }],
          })
        : [],
    ])

    const hasMore = files.length > limit
    const fileSlice = hasMore ? files.slice(0, -1) : files
    const last = fileSlice[fileSlice.length - 1]
    const nextCursor = hasMore && last
      ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: last.id })).toString('base64')
      : null

    const breadcrumb = await this.buildBreadcrumb(id)

    return {
      folder: await this.prisma.folder.findUnique({ where: { id } }),
      breadcrumb,
      items: [...folders, ...fileSlice],
      nextCursor,
    }
  }

  async getStats(id: string, userId: string) {
    await this.findOne(id, userId)

    const cacheKey = `folder:${id}:stats`
    const cached = await this.redis.get(cacheKey)
    if (cached) return JSON.parse(cached) as { totalSize: number; itemCount: number }

    const [result] = await this.prisma.$queryRaw<{ total_size: bigint; item_count: bigint }[]>`
      WITH RECURSIVE subtree AS (
        SELECT id FROM "Folder" WHERE id = ${id}
        UNION ALL
        SELECT f.id FROM "Folder" f INNER JOIN subtree s ON f."parentId" = s.id
      )
      SELECT
        COALESCE(SUM(fi.size), 0) AS total_size,
        COUNT(fi.id) AS item_count
      FROM "File" fi
      WHERE fi."folderId" IN (SELECT id FROM subtree)
    `

    const stats = {
      totalSize: Number(result.total_size),
      itemCount: Number(result.item_count),
    }

    await this.redis.set(cacheKey, JSON.stringify(stats), STATS_TTL)
    return stats
  }

  async update(id: string, dto: UpdateFolderDto, userId: string) {
    await this.findOne(id, userId)
    return this.prisma.folder.update({ where: { id }, data: { name: dto.name } })
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    await this.invalidateFolderStatsCache(id)
    return this.prisma.folder.delete({ where: { id } })
  }

  async invalidateFolderStatsCache(folderId: string) {
    let currentId = folderId
    let current: { parentId: string | null } | null = await this.prisma.folder.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })

    while (current) {
      await this.redis.del(`folder:${currentId}:stats`)
      if (!current.parentId) break
      currentId = current.parentId
      current = await this.prisma.folder.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      })
    }
  }

  private async buildBreadcrumb(folderId: string): Promise<{ id: string; name: string }[]> {
    const crumbs: { id: string; name: string }[] = []
    let current: { id: string; name: string; parentId: string | null } | null =
      await this.prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true, name: true, parentId: true },
      })

    while (current) {
      crumbs.unshift({ id: current.id, name: current.name })
      if (!current.parentId) break
      current = await this.prisma.folder.findUnique({
        where: { id: current.parentId },
        select: { id: true, name: true, parentId: true },
      })
    }

    return crumbs
  }
}
