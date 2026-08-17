import { Test } from '@nestjs/testing'
import { SharesService } from './shares.service'
import { PrismaService } from '../prisma/prisma.service'
import { BadRequestException, ForbiddenException } from '@nestjs/common'

const mockShare = {
  id: 'share1',
  type: 'PUBLIC',
  token: 'tok1',
  role: 'VIEWER',
  dataRoomId: 'room1',
  folderId: null,
  fileId: null,
  sharedById: 'user1',
  sharedWithId: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: new Date(),
}

const mockUser = { id: 'user2', email: 'other@example.com' }

const mockPrisma = {
  share: {
    create: jest.fn().mockResolvedValue(mockShare),
    findMany: jest.fn().mockResolvedValue([mockShare]),
    findUnique: jest.fn().mockResolvedValue(mockShare),
    update: jest.fn().mockResolvedValue({ ...mockShare, revokedAt: new Date() }),
  },
  user: { findUnique: jest.fn().mockResolvedValue(mockUser) },
}

describe('SharesService', () => {
  let service: SharesService

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        SharesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get(SharesService)
  })

  it('create throws BadRequestException when no target provided', async () => {
    await expect(
      service.create({ type: 'PUBLIC', role: 'VIEWER' }, 'user1'),
    ).rejects.toThrow(BadRequestException)
  })

  it('revoke throws ForbiddenException when not owner', async () => {
    mockPrisma.share.findUnique.mockResolvedValue({ ...mockShare, sharedById: 'other-user' })
    await expect(service.revoke('share1', 'user1')).rejects.toThrow(ForbiddenException)
  })

  it('create a public share', async () => {
    const result = await service.create({ type: 'PUBLIC', role: 'VIEWER', dataRoomId: 'room1' }, 'user1')
    expect(result.type).toBe('PUBLIC')
  })
})
