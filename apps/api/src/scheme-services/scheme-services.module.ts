import { Module } from '@nestjs/common';
import { SchemeServicesController } from './scheme-services.controller';
import { SchemeServicesService } from './scheme-services.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchemeServicesController],
  providers: [SchemeServicesService],
  exports: [SchemeServicesService],
})
export class SchemeServicesModule {}
