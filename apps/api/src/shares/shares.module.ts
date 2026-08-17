import { Module } from '@nestjs/common'
import { SharesController } from './shares.controller'
import { PublicSharesController } from './public/public-shares.controller'
import { SharesService } from './shares.service'

@Module({
  controllers: [SharesController, PublicSharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}
