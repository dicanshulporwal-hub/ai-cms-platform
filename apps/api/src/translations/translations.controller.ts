import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TranslationRouterService } from './translation-router.service';

@ApiTags('Translations')
@ApiBearerAuth()
@Controller('translations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TranslationsController {
  constructor(private readonly router: TranslationRouterService) {}

  @Post('translate')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Translate text.' })
  translate(@Body() dto: { text: string; sourceLanguage: string; targetLanguage: string; providerKey?: string; selectionMode?: string; allowFallback?: boolean }) {
    return this.router.translate(dto);
  }

  @Post('translate-batch')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Batch translate texts.' })
  translateBatch(@Body() dto: { texts: string[]; sourceLanguage: string; targetLanguage: string; providerKey?: string }) {
    return this.router.translateBatch(dto);
  }

  @Post('transliterate')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Transliterate text (Bhashini).' })
  transliterate(@Body() dto: { text: string; sourceLanguage: string; targetLanguage: string }) {
    return this.router.transliterate(dto);
  }
}
