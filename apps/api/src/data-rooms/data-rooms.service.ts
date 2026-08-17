import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDataRoomDto } from './dto/create-data-room.dto'
import { UpdateDataRoomDto } from './dto/update-data-room.dto'
import { SearchDto } from './dto/search.dto'

@Injectable()
export class DataRoomsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.dataRoom.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, userId: string) {
    const room = await this.prisma.dataRoom.findUnique({ where: { id } })
    if (!room) throw new NotFoundException()
    if (room.ownerId !== userId) throw new ForbiddenException()
    return room
  }

  create(dto: CreateDataRoomDto, ownerId: string) {
    return this.prisma.dataRoom.create({
      data: { name: dto.name, ownerId },
    })
  }

  async update(id: string, dto: UpdateDataRoomDto, userId: string) {
    await this.findOne(id, userId)
    return this.prisma.dataRoom.update({ where: { id }, data: { name: dto.name } })
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    return this.prisma.dataRoom.delete({ where: { id } })
  }

  async search(roomId: string, dto: SearchDto, userId: string) {
    await this.findOne(roomId, userId)

    const limit = dto.limit ?? 50

    const [folders, files] = await Promise.all([
      dto.type !== 'file'
        ? this.prisma.folder.findMany({
            where: { dataRoomId: roomId, name: { contains: dto.q, mode: 'insensitive' } },
            take: limit,
          })
        : [],
      dto.type !== 'folder'
        ? this.prisma.file.findMany({
            where: {
              name: { contains: dto.q, mode: 'insensitive' },
              folder: { dataRoomId: roomId },
              ...(dto.folderId ? { folderId: dto.folderId } : {}),
            },
            take: limit,
            include: { folder: { select: { name: true, parentId: true } } },
          })
        : [],
    ])

    return { folders, files }
  }
}
