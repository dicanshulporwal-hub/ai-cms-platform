import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../prisma/prisma.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize:
            configService.get<number>('MAX_UPLOAD_SIZE_MB', 5) * 1024 * 1024,
        },
      }),
    }),
    PrismaModule,
  ],
  providers: [MediaService],
})
export class MediaModule {}
