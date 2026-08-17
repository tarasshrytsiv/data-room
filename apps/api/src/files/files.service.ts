import {
  ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { FoldersService } from '../folders/folders.service'
import { CreateFileDto } from './dto/create-file.dto'
import { MoveFileDto } from './dto/move-file.dto'

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly folders: FoldersService,
  ) {}

  async getPresignedUrl(folderId: string, fileName: string, userId: string) {
    await this.folders.findOne(folderId, userId)
    const storageKey = `${userId}/${folderId}/${randomUUID()}-${fileName}`
    const url = await this.storage.createUploadUrl(storageKey)
    return { url, storageKey }
  }

  async findOne(id: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: { folder: { include: { dataRoom: { select: { ownerId: true } } } } },
    })
    if (!file) throw new NotFoundException()
    if (file.folder.dataRoom.ownerId !== userId) throw new ForbiddenException()
    return file
  }

  async create(dto: CreateFileDto, userId: string) {
    await this.folders.findOne(dto.folderId, userId)
    const file = await this.prisma.file.create({ data: dto })
    await this.folders.invalidateFolderStatsCache(dto.folderId)
    return file
  }

  async getViewUrl(id: string, userId: string) {
    const file = await this.findOne(id, userId)
    const url = await this.storage.createViewUrl(file.storageKey)
    return { url }
  }

  async rename(id: string, name: string, userId: string) {
    const file = await this.findOne(id, userId)

    const conflict = await this.prisma.file.findFirst({
      where: { folderId: file.folderId, name, id: { not: id } },
    })
    if (conflict) throw new ConflictException('File name already exists in this folder')

    const existing = await this.prisma.file.findUnique({ where: { id } })
    await this.prisma.fileVersion.create({
      data: { fileId: id, storageKey: existing!.storageKey, size: existing!.size },
    })

    return this.prisma.file.update({ where: { id }, data: { name } })
  }

  async move(id: string, dto: MoveFileDto, userId: string) {
    const file = await this.findOne(id, userId)
    await this.folders.findOne(dto.targetFolderId, userId)

    const conflict = await this.prisma.file.findFirst({
      where: { folderId: dto.targetFolderId, name: file.name },
    })
    if (conflict) throw new ConflictException('File name already exists in target folder')

    const updated = await this.prisma.file.update({
      where: { id },
      data: { folderId: dto.targetFolderId },
    })

    await Promise.all([
      this.folders.invalidateFolderStatsCache(file.folderId),
      this.folders.invalidateFolderStatsCache(dto.targetFolderId),
    ])

    return updated
  }

  async remove(id: string, userId: string) {
    const file = await this.findOne(id, userId)
    await this.prisma.file.delete({ where: { id } })
    await this.storage.deleteObject(file.storageKey)
    await this.folders.invalidateFolderStatsCache(file.folderId)
    return file
  }
}
