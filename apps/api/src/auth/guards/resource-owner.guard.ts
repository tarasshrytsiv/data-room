import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<{
      user: { id: string }
      resource: { ownerId: string }
    }>()

    if (request.resource?.ownerId !== request.user?.id) {
      throw new ForbiddenException()
    }

    return true
  }
}
