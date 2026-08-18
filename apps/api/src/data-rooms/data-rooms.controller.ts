import {
  All, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common'
import { DataRoomsService } from './data-rooms.service'
import { CreateDataRoomDto } from './dto/create-data-room.dto'
import { UpdateDataRoomDto } from './dto/update-data-room.dto'
import { SearchDto } from './dto/search.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { QueryMethodGuard } from '../auth/guards/query-method.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { User } from '@prisma/client'

@Controller('data-rooms')
@UseGuards(JwtAuthGuard)
export class DataRoomsController {
  constructor(private readonly service: DataRoomsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id)
  }

  @Post()
  create(@Body() dto: CreateDataRoomDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.findOne(id, user.id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDataRoomDto, @CurrentUser() user: User) {
    return this.service.update(id, dto, user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.remove(id, user.id)
  }

  @Get(':id/contents')
  getRootContents(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.getRootContents(id, user.id)
  }

  @Get(':id/folders')
  getAllFolders(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.getAllFolders(id, user.id)
  }

  @All(':id/search')
  @UseGuards(QueryMethodGuard)
  search(@Param('id') id: string, @Body() dto: SearchDto, @CurrentUser() user: User) {
    return this.service.search(id, dto, user.id)
  }
}
