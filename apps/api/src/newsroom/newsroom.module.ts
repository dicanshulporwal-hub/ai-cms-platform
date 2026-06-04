import { Module } from '@nestjs/common';
import { NewsroomController } from './newsroom.controller';
import { NewsroomService } from './newsroom.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NewsroomController],
  providers: [NewsroomService],
  exports: [NewsroomService],
})
export class NewsroomModule {}
