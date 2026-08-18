import { All, Controller, Get, Param, UseGuards } from '@nestjs/common'
import { SharesService } from '../shares.service'
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard'
import { ShareAccessGuard } from '../../auth/guards/share-access.guard'
import { QueryMethodGuard } from '../../auth/guards/query-method.guard'

@Controller('shared')
@UseGuards(OptionalJwtAuthGuard, ShareAccessGuard)
export class PublicSharesController {
  constructor(private readonly service: SharesService) {}

  @Get(':token')
  getSharedContent(@Param('token') token: string) {
    return this.service.getSharedContent(token)
  }

  @All(':token/contents')
  @UseGuards(QueryMethodGuard)
  getSharedContents(@Param('token') token: string) {
    return this.service.getSharedContents(token)
  }

  @Get(':token/files/:fileId/view-url')
  getSharedFileViewUrl(@Param('token') token: string, @Param('fileId') fileId: string) {
    return this.service.getSharedFileViewUrl(token, fileId)
  }
}
