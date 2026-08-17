import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { StorageModule } from './storage/storage.module'
import { AuthModule } from './auth/auth.module'
import { DataRoomsModule } from './data-rooms/data-rooms.module'
import { FoldersModule } from './folders/folders.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    StorageModule,
    AuthModule,
    DataRoomsModule,
    FoldersModule,
  ],
})
export class AppModule {}
