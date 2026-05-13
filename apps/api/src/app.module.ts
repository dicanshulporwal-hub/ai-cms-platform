import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      isGlobal: true,
      validate: validateEnvironment,
    }),
    HealthModule,
    PrismaModule,
  ],
})
export class AppModule {}
