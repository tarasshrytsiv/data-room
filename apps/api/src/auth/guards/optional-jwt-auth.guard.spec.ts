import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ExecutionContext } from '@nestjs/common'
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard'
import { PrismaService } from '../../prisma/prisma.service'

const mockUser = { id: 'user1', email: 'user@example.com' }

const mockJwtService = {
  verify: jest.fn(),
}

const mockPrismaService = {
  user: {
    upsert: jest.fn().mockResolvedValue(mockUser),
  },
}

function buildContext(authHeader?: string): ExecutionContext {
  const request: Record<string, unknown> = {
    headers: authHeader ? { authorization: authHeader } : {},
  }
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    _request: request,
  } as unknown as ExecutionContext
}

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard

  beforeEach(async () => {
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        OptionalJwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    guard = module.get(OptionalJwtAuthGuard)
  })

  it('sets request.user and returns true when token is valid', async () => {
    mockJwtService.verify.mockReturnValue({ sub: 'user1', email: 'user@example.com' })
    const ctx = buildContext('Bearer valid-token')
    const result = await guard.canActivate(ctx)

    const request = ctx.switchToHttp().getRequest<{ user?: typeof mockUser }>()
    expect(result).toBe(true)
    expect(request.user).toEqual(mockUser)
    expect(mockPrismaService.user.upsert).toHaveBeenCalledTimes(1)
  })

  it('leaves request.user undefined and returns true when no token is present', async () => {
    const ctx = buildContext()
    const result = await guard.canActivate(ctx)

    const request = ctx.switchToHttp().getRequest<{ user?: unknown }>()
    expect(result).toBe(true)
    expect(request.user).toBeUndefined()
    expect(mockJwtService.verify).not.toHaveBeenCalled()
  })

  it('leaves request.user undefined and returns true when token is invalid', async () => {
    mockJwtService.verify.mockImplementation(() => { throw new Error('invalid token') })
    const ctx = buildContext('Bearer bad-token')
    const result = await guard.canActivate(ctx)

    const request = ctx.switchToHttp().getRequest<{ user?: unknown }>()
    expect(result).toBe(true)
    expect(request.user).toBeUndefined()
  })
})
