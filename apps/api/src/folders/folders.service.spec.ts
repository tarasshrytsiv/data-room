import { Test } from '@nestjs/testing'
import { FoldersService } from './folders.service'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'

const mockFolder = {
  id: 'folder1', name: 'Docs', dataRoomId: 'room1', parentId: null,
  createdAt: new Date(), updatedAt: new Date(),
  dataRoom: { ownerId: 'user1' },
}

const mockPrisma = {
  folder: {
    create: jest.fn().mockResolvedValue(mockFolder),
    findUnique: jest.fn().mockResolvedValue(mockFolder),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  file: { count: jest.fn().mockResolvedValue(0), aggregate: jest.fn().mockResolvedValue({ _sum: { size: 0 } }) },
  $queryRaw: jest.fn().mockResolvedValue([{ totalSize: 0, itemCount: 0 }]),
}

const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn(),
  delPattern: jest.fn(),
}

describe('FoldersService', () => {
  let service: FoldersService

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        FoldersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile()

    service = module.get(FoldersService)
  })

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.folder.findUnique.mockResolvedValueOnce(null)
    await expect(service.findOne('missing', 'user1')).rejects.toThrow(NotFoundException)
  })

  it('findOne throws ForbiddenException when not owner', async () => {
    await expect(service.findOne('folder1', 'other')).rejects.toThrow(ForbiddenException)
  })

  it('create throws ConflictException on duplicate root-level name', async () => {
    mockPrisma.folder.findMany.mockResolvedValueOnce([mockFolder])
    await expect(
      service.create({ name: 'Docs', dataRoomId: 'room1' }, 'user1'),
    ).rejects.toThrow(ConflictException)
  })
})
