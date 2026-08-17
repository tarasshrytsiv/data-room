import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) return true

    try {
      const payload = this.jwt.verify<{ sub: string; email: string }>(token, {
        secret: process.env.SUPABASE_JWT_SECRET,
      })

      const user = await this.prisma.user.upsert({
        where: { id: payload.sub },
        create: { id: payload.sub, email: payload.email },
        update: {},
      })

      request.user = user
    } catch {
      // Invalid token — leave request.user unset and allow through
    }

    return true
  }

  private extractToken(request: { headers: { authorization?: string } }): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
