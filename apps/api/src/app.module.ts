import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { validateEnvironment } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PagesModule } from './pages/pages.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { WorkflowModule } from './workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      isGlobal: true,
      validate: validateEnvironment,
    }),
    AiModule,
    AuthModule,
    BlogsModule,
    ChatbotModule,
    DashboardModule,
    HealthModule,
    MediaModule,
    NotificationsModule,
    PagesModule,
    PrismaModule,
    RolesModule,
    UsersModule,
    WorkflowModule,
  ],
})
export class AppModule {}
