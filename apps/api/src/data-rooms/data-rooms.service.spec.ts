import { Test } from '@nestjs/testing'
import { DataRoomsService } from './data-rooms.service'
import { PrismaService } from '../prisma/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'

const mockRoom = { id: 'room1', name: 'Test Room', ownerId: 'user1', createdAt: new Date(), updatedAt: new Date() }

const mockPrisma = {
  dataRoom: {
    findMany: jest.fn().mockResolvedValue([mockRoom]),
    findUnique: jest.fn().mockResolvedValue(mockRoom),
    create: jest.fn().mockResolvedValue(mockRoom),
    update: jest.fn().mockResolvedValue({ ...mockRoom, name: 'Renamed' }),
    delete: jest.fn().mockResolvedValue(mockRoom),
  },
}

describe('DataRoomsService', () => {
  let service: DataRoomsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DataRoomsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get(DataRoomsService)
  })

  it('findAll returns rooms for user', async () => {
    const result = await service.findAll('user1')
    expect(result).toEqual([mockRoom])
    expect(mockPrisma.dataRoom.findMany).toHaveBeenCalledWith({ where: { ownerId: 'user1' }, orderBy: { createdAt: 'desc' } })
  })

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.dataRoom.findUnique.mockResolvedValueOnce(null)
    await expect(service.findOne('missing', 'user1')).rejects.toThrow(NotFoundException)
  })

  it('findOne throws ForbiddenException when not owner', async () => {
    await expect(service.findOne('room1', 'other-user')).rejects.toThrow(ForbiddenException)
  })

  it('create creates a data room', async () => {
    const result = await service.create({ name: 'Test Room' }, 'user1')
    expect(result).toEqual(mockRoom)
  })
})
