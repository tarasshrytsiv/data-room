import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { SupabaseModule } from './supabase/supabase.module'
import { StorageModule } from './storage/storage.module'
import { AuthModule } from './auth/auth.module'
import { DataRoomsModule } from './data-rooms/data-rooms.module'
import { FoldersModule } from './folders/folders.module'
import { FilesModule } from './files/files.module'
import { SharesModule } from './shares/shares.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    RedisModule,
    SupabaseModule,
    StorageModule,
    AuthModule,
    DataRoomsModule,
    FoldersModule,
    FilesModule,
    SharesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
