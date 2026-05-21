import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  controllers: [PagesController],
  imports: [PrismaModule],
  providers: [PagesService],
})
export class PagesModule {}
