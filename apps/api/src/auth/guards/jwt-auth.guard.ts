import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) throw new UnauthorizedException()

    const { data, error } = await this.supabase.client.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedException()

    const user = await this.prisma.user.upsert({
      where: { id: data.user.id },
      create: { id: data.user.id, email: data.user.email! },
      update: {},
    })

    request.user = user
    return true
  }

  private extractToken(request: { headers: { authorization?: string } }): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
