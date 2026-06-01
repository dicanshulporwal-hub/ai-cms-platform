import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { PagesController } from './pages.controller';
import { PublicPagesController } from './public-pages.controller';
import { PagesService } from './pages.service';

@Module({
  controllers: [PagesController, PublicPagesController],
  imports: [PrismaModule, WorkflowModule],
  providers: [PagesService],
})
export class PagesModule {}
