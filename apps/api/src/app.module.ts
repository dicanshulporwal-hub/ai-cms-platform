import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { validateEnvironment } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AuthModule,
    BlogsModule,
    HealthModule,
    MediaModule,
    PagesModule,
    PrismaModule,
    RolesModule,
    UsersModule,
  ],
})
export class AppModule {}
