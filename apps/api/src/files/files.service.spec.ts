import { Test } from '@nestjs/testing'
import { FilesService } from './files.service'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { FoldersService } from '../folders/folders.service'
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'

const mockFile = {
  id: 'file1', name: 'doc.pdf', storageKey: 'key1', mimeType: 'application/pdf',
  size: 1024, folderId: 'folder1', createdAt: new Date(), updatedAt: new Date(),
  folder: { dataRoom: { ownerId: 'user1' } },
}

const mockPrisma = {
  file: {
    findUnique: jest.fn().mockResolvedValue(mockFile),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockFile),
    update: jest.fn().mockResolvedValue(mockFile),
    delete: jest.fn().mockResolvedValue(mockFile),
  },
  fileVersion: {
    create: jest.fn().mockResolvedValue({}),
  },
}

const mockStorage = {
  createUploadUrl: jest.fn().mockResolvedValue('https://upload.url'),
  createViewUrl: jest.fn().mockResolvedValue('https://view.url'),
  deleteObject: jest.fn(),
}

const mockFolders = {
  findOne: jest.fn().mockResolvedValue({ id: 'folder1' }),
  invalidateFolderStatsCache: jest.fn(),
}

describe('FilesService', () => {
  let service: FilesService

  beforeEach(async () => {
    jest.clearAllMocks()
    mockPrisma.file.findUnique.mockResolvedValue(mockFile)
    mockPrisma.file.findFirst.mockResolvedValue(null)
    mockFolders.findOne.mockResolvedValue({ id: 'folder1' })

    const module = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorage },
        { provide: FoldersService, useValue: mockFolders },
      ],
    }).compile()

    service = module.get(FilesService)
  })

  it('getPresignedUrl returns url and storageKey', async () => {
    const result = await service.getPresignedUrl('folder1', 'doc.pdf', 'user1')
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('storageKey')
  })

  it('findOne throws ForbiddenException when not owner', async () => {
    await expect(service.findOne('file1', 'other')).rejects.toThrow(ForbiddenException)
  })

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.file.findUnique.mockResolvedValueOnce(null)
    await expect(service.findOne('missing', 'user1')).rejects.toThrow(NotFoundException)
  })

  it('rename throws ConflictException on duplicate name in folder', async () => {
    mockPrisma.file.findFirst.mockResolvedValueOnce(mockFile)
    await expect(service.rename('file1', 'doc.pdf', 'user1')).rejects.toThrow(ConflictException)
  })
})
