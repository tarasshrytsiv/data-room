import { All, Controller, Get, Param, UseGuards } from '@nestjs/common'
import { SharesService } from '../shares.service'
import { ShareAccessGuard } from '../../auth/guards/share-access.guard'
import { QueryMethodGuard } from '../../auth/guards/query-method.guard'

@Controller('shared')
export class PublicSharesController {
  constructor(private readonly service: SharesService) {}

  @Get(':token')
  @UseGuards(ShareAccessGuard)
  getSharedContent(@Param('token') token: string) {
    return this.service.getSharedContent(token)
  }

  @All(':token/contents')
  @UseGuards(ShareAccessGuard, QueryMethodGuard)
  getSharedContents(@Param('token') token: string) {
    return this.service.getSharedContent(token)
  }
}
