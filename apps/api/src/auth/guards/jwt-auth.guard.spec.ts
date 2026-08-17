import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtAuthGuard } from './jwt-auth.guard'
import { PrismaService } from '../../prisma/prisma.service'

const mockPrisma = {
  user: {
    upsert: jest.fn().mockResolvedValue({
      id: 'user-uuid',
      email: 'test@example.com',
    }),
  },
}

const mockJwtService = {
  verify: jest.fn().mockReturnValue({ sub: 'user-uuid', email: 'test@example.com' }),
}

function makeContext(authHeader?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: authHeader },
        user: undefined,
      }),
    }),
  } as unknown as ExecutionContext
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard

  beforeEach(() => {
    guard = new JwtAuthGuard(
      mockJwtService as unknown as JwtService,
      mockPrisma as unknown as PrismaService,
    )
  })

  it('throws when no token', async () => {
    await expect(guard.canActivate(makeContext())).rejects.toThrow(UnauthorizedException)
  })

  it('attaches user to request when token is valid', async () => {
    const ctx = makeContext('Bearer valid.token.here')
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
  })
})
