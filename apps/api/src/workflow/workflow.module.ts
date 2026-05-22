import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  controllers: [WorkflowController],
  exports: [WorkflowService],
  imports: [NotificationsModule, PrismaModule],
  providers: [WorkflowService],
})
export class WorkflowModule {}
