import { Module } from '@nestjs/common';
import { AccessibilityController } from './accessibility.controller';
import { AccessibilityService } from './accessibility.service';
import { AccessibilityCheckService } from './accessibility-check.service';

@Module({
  controllers: [AccessibilityController],
  providers: [AccessibilityService, AccessibilityCheckService],
  exports: [AccessibilityService, AccessibilityCheckService],
})
export class AccessibilityModule {}
