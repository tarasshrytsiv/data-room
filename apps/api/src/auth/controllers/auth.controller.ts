import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from '@prisma/client'

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return user
  }
}
