import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ShareAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<{
      params: { token: string }
      user?: { id: string }
      share: object
    }>()

    const share = await this.prisma.share.findUnique({
      where: { token: request.params.token },
    })

    if (!share || share.revokedAt) throw new NotFoundException()
    if (share.expiresAt && share.expiresAt < new Date()) throw new ForbiddenException()
    if (share.type === 'PERMISSIONED' && share.sharedWithId !== request.user?.id) {
      throw new ForbiddenException()
    }

    request.share = share
    return true
  }
}
