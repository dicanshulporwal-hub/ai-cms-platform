import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { FormFieldsService } from './form-fields.service';
import { FormSubmissionsController } from './form-submissions.controller';
import { FormSubmissionsService } from './form-submissions.service';
import { FormAIService } from './form-ai.service';
import { PublicFormsController } from './public-forms.controller';

@Module({
  imports: [ConfigModule, AiModule],
  controllers: [FormsController, FormSubmissionsController, PublicFormsController],
  providers: [FormsService, FormFieldsService, FormSubmissionsService, FormAIService],
})
export class FormsModule {}
