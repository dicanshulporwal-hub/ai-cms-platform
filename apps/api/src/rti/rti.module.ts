import { Module } from '@nestjs/common';
import { RtiController } from './rti.controller';
import { RtiService } from './rti.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RtiController],
  providers: [RtiService],
  exports: [RtiService],
})
export class RtiModule {}
