import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateShareDto } from './dto/create-share.dto'

@Injectable()
export class SharesService {
  constructor(private readonly prisma: PrismaService) {}

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

    return {
      share,
      isReadOnly: true,
    }
  }
}
