import { Test } from '@nestjs/testing'
import { RedisService } from './redis.service'

describe('RedisService', () => {
  let service: RedisService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            delPattern: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(RedisService)
  })

  it('set and get a value', async () => {
    jest.spyOn(service, 'set').mockResolvedValue()
    jest.spyOn(service, 'get').mockResolvedValue('cached')

    await service.set('key', 'cached', 60)
    const result = await service.get('key')

    expect(result).toBe('cached')
  })

  it('del removes a key', async () => {
    jest.spyOn(service, 'del').mockResolvedValue()
    await expect(service.del('key')).resolves.toBeUndefined()
  })
})
