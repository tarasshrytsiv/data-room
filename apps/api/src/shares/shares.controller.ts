import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { SharesService } from './shares.service'
import { CreateShareDto } from './dto/create-share.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { User } from '@prisma/client'

@Controller('shares')
@UseGuards(JwtAuthGuard)
export class SharesController {
  constructor(private readonly service: SharesService) {}

  @Post()
  create(@Body() dto: CreateShareDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id)
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id)
  }

  @Delete(':id')
  revoke(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.revoke(id, user.id)
  }
}
