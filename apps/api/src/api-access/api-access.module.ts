import { Module } from '@nestjs/common';
import { ApiAccessController } from './api-access.controller';
import { ContentDeliveryController } from './content-delivery.controller';
import { ApiAccessService } from './api-access.service';

@Module({
  controllers: [ApiAccessController, ContentDeliveryController],
  providers: [ApiAccessService],
  exports: [ApiAccessService],
})
export class ApiAccessModule {}
