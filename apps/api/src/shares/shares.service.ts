import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { CreateShareDto } from './dto/create-share.dto'

@Injectable()
export class SharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(dto: CreateShareDto, sharedById: string) {
    if (!dto.dataRoomId && !dto.folderId && !dto.fileId) {
      throw new BadRequestException('Must specify dataRoomId, folderId, or fileId')
    }

    if (dto.dataRoomId) {
      const resource = await this.prisma.dataRoom.findUnique({ where: { id: dto.dataRoomId } })
      if (!resource) throw new NotFoundException('DataRoom not found')
      if (resource.ownerId !== sharedById) throw new ForbiddenException()
    } else if (dto.folderId) {
      const resource = await this.prisma.folder.findUnique({
        where: { id: dto.folderId },
        include: { dataRoom: { select: { ownerId: true } } },
      })
      if (!resource) throw new NotFoundException('Folder not found')
      if (resource.dataRoom.ownerId !== sharedById) throw new ForbiddenException()
    } else if (dto.fileId) {
      const resource = await this.prisma.file.findUnique({
        where: { id: dto.fileId },
        include: { folder: { include: { dataRoom: { select: { ownerId: true } } } } },
      })
      if (!resource) throw new NotFoundException('File not found')
      if (resource.folder.dataRoom.ownerId !== sharedById) throw new ForbiddenException()
    }

    let sharedWithId: string | undefined

    if (dto.type === 'PERMISSIONED' && dto.sharedWithEmail) {
      const user = await this.prisma.user.findUnique({ where: { email: dto.sharedWithEmail } })
      if (!user) throw new NotFoundException('User not found')
      sharedWithId = user.id
    }

    return this.prisma.share.create({
      data: {
        type: dto.type,
        role: dto.role,
        dataRoomId: dto.dataRoomId,
        folderId: dto.folderId,
        fileId: dto.fileId,
        sharedById,
        sharedWithId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    })
  }

  findAll(userId: string) {
    return this.prisma.share.findMany({
      where: { sharedById: userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  findSharedWithMe(userId: string) {
    return this.prisma.share.findMany({
      where: { sharedWithId: userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        sharedBy: { select: { email: true } },
        dataRoom: { select: { name: true } },
        folder: { select: { name: true } },
        file: { select: { name: true } },
      },
    })
  }

  async revoke(id: string, userId: string) {
    const share = await this.prisma.share.findUnique({ where: { id } })
    if (!share) throw new NotFoundException()
    if (share.sharedById !== userId) throw new ForbiddenException()

    return this.prisma.share.update({
      where: { id },
      data: { revokedAt: new Date() },
    })
  }

  async getSharedContent(token: string) {
    const share = await this.prisma.share.findUnique({ where: { token } })
    if (!share) throw new NotFoundException()

    let viewUrl: string | null = null
    if (share.fileId) {
      const file = await this.prisma.file.findUnique({ where: { id: share.fileId } })
      if (file) viewUrl = await this.storage.createViewUrl(file.storageKey)
    }

    return { share, isReadOnly: true, viewUrl }
  }

  async getSharedContents(token: string) {
    const share = await this.prisma.share.findUnique({ where: { token } })
    if (!share) throw new NotFoundException()

    if (share.folderId) {
      const [folders, files] = await Promise.all([
        this.prisma.folder.findMany({ where: { parentId: share.folderId }, orderBy: { createdAt: 'asc' } }),
        this.prisma.file.findMany({ where: { folderId: share.folderId }, orderBy: { createdAt: 'asc' } }),
      ])
      return { items: [...folders, ...files] }
    }

    if (share.dataRoomId) {
      const folders = await this.prisma.folder.findMany({
        where: { dataRoomId: share.dataRoomId, parentId: null },
        orderBy: { createdAt: 'asc' },
      })
      return { items: folders }
    }

    return { items: [] }
  }

  async getSharedFileViewUrl(token: string, fileId: string) {
    const share = await this.prisma.share.findUnique({ where: { token } })
    if (!share) throw new NotFoundException()

    const file = await this.prisma.file.findUnique({ where: { id: fileId } })
    if (!file) throw new NotFoundException()

    if (share.fileId) {
      if (share.fileId !== fileId) throw new ForbiddenException()
    } else if (share.folderId) {
      if (file.folderId !== share.folderId) throw new ForbiddenException()
    } else if (share.dataRoomId) {
      const folder = await this.prisma.folder.findUnique({ where: { id: file.folderId } })
      if (!folder || folder.dataRoomId !== share.dataRoomId) throw new ForbiddenException()
    }

    return { viewUrl: await this.storage.createViewUrl(file.storageKey) }
  }
}
