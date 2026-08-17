import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { FilesService } from './files.service'
import { CreateFileDto } from './dto/create-file.dto'
import { PresignedUrlDto } from './dto/presigned-url.dto'
import { MoveFileDto } from './dto/move-file.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { User } from '@prisma/client'

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() dto: PresignedUrlDto, @CurrentUser() user: User) {
    return this.service.getPresignedUrl(dto.folderId, dto.fileName, user.id)
  }

  @Post()
  create(@Body() dto: CreateFileDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.findOne(id, user.id)
  }

  @Get(':id/view-url')
  getViewUrl(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.getViewUrl(id, user.id)
  }

  @Patch(':id')
  rename(
    @Param('id') id: string,
    @Body() dto: { name: string },
    @CurrentUser() user: User,
  ) {
    return this.service.rename(id, dto.name, user.id)
  }

  @Patch(':id/move')
  move(@Param('id') id: string, @Body() dto: MoveFileDto, @CurrentUser() user: User) {
    return this.service.move(id, dto, user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.remove(id, user.id)
  }
}
