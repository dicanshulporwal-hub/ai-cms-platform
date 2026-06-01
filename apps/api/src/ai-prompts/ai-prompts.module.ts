import { Module } from '@nestjs/common';
import { AiPromptsController } from './ai-prompts.controller';
import { AiPromptsService } from './ai-prompts.service';
import { AiPromptRenderingService } from './ai-prompt-rendering.service';

@Module({
  controllers: [AiPromptsController],
  providers: [AiPromptsService, AiPromptRenderingService],
  exports: [AiPromptsService, AiPromptRenderingService],
})
export class AiPromptsModule {}
