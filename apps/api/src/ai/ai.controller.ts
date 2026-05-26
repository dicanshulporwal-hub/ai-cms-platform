import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiService } from './ai.service';
import { AiResponseDto } from './dto/ai-response.dto';
import { AiUsageLogResponseDto } from './dto/ai-usage-log-response.dto';
import { AiUsageQueryDto } from './dto/ai-usage-query.dto';
import { GenerateAltTextDto } from './dto/generate-alt-text.dto';
import { GenerateContentDto } from './dto/generate-content.dto';
import { GenerateFaqDto } from './dto/generate-faq.dto';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { ImproveSeoDto } from './dto/improve-seo.dto';
import { RewriteContentDto } from './dto/rewrite-content.dto';
import { SummarizeContentDto } from './dto/summarize-content.dto';

const AI_ROLES = ['Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher'];

@ApiBearerAuth()
@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...AI_ROLES)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-content')
  @ApiOkResponse({ type: AiResponseDto })
  generateContent(
    @Body() dto: GenerateContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateContent(dto, user);
  }

  @Post('rewrite-content')
  @ApiOkResponse({ type: AiResponseDto })
  rewriteContent(
    @Body() dto: RewriteContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.rewriteContent(dto, user);
  }

  @Post('summarize-content')
  @ApiOkResponse({ type: AiResponseDto })
  summarizeContent(
    @Body() dto: SummarizeContentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.summarizeContent(dto, user);
  }

  @Post('generate-faq')
  @ApiOkResponse({ type: AiResponseDto })
  generateFaq(
    @Body() dto: GenerateFaqDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateFaq(dto, user);
  }

  @Post('generate-seo')
  @ApiOkResponse({ type: AiResponseDto })
  generateSeo(
    @Body() dto: GenerateSeoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateSeo(dto, user);
  }

  @Post('improve-seo')
  @ApiOkResponse({ type: AiResponseDto })
  improveSeo(
    @Body() dto: ImproveSeoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.improveSeo(dto, user);
  }

  @Post('generate-alt-text')
  @ApiOkResponse({ type: AiResponseDto })
  generateAltText(
    @Body() dto: GenerateAltTextDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateAltText(dto, user);
  }

  @Get('usage')
  @ApiOkResponse({ type: AiUsageLogResponseDto, isArray: true })
  findUsage(@Query() query: AiUsageQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.aiService.findUsageLogs(query, user);
  }
}
