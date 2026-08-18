import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard'
import { ResourceOwnerGuard } from './guards/resource-owner.guard'
import { QueryMethodGuard } from './guards/query-method.guard'
import { ShareAccessGuard } from './guards/share-access.guard'
import { AuthController } from './controllers/auth.controller'

@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [JwtAuthGuard, OptionalJwtAuthGuard, ResourceOwnerGuard, QueryMethodGuard, ShareAccessGuard],
  exports: [JwtAuthGuard, OptionalJwtAuthGuard, ResourceOwnerGuard, QueryMethodGuard, ShareAccessGuard],
})
export class AuthModule {}
