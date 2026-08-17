import { CanActivate, ExecutionContext, Injectable, MethodNotAllowedException } from '@nestjs/common'

@Injectable()
export class QueryMethodGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const method = ctx.switchToHttp().getRequest<{ method: string }>().method
    if (method !== 'QUERY') throw new MethodNotAllowedException()
    return true
  }
}
