import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';

@Module({
  imports: [ConfigModule],
  controllers: [DeploymentController],
  providers: [DeploymentService],
  exports: [DeploymentService],
})
export class DeploymentModule {}
