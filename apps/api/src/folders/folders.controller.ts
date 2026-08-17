import { All, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { FoldersService } from './folders.service'
import { CreateFolderDto } from './dto/create-folder.dto'
import { UpdateFolderDto } from './dto/update-folder.dto'
import { FolderContentsDto } from './dto/folder-contents.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { QueryMethodGuard } from '../auth/guards/query-method.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { User } from '@prisma/client'

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly service: FoldersService) {}

  @Post()
  create(@Body() dto: CreateFolderDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.findOne(id, user.id)
  }

  @All(':id/contents')
  @UseGuards(QueryMethodGuard)
  getContents(@Param('id') id: string, @Body() dto: FolderContentsDto, @CurrentUser() user: User) {
    return this.service.getContents(id, user.id, dto)
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.getStats(id, user.id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFolderDto, @CurrentUser() user: User) {
    return this.service.update(id, dto, user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.remove(id, user.id)
  }
}
