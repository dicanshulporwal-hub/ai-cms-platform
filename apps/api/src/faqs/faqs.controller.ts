import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ModuleEnabled } from '../modules/module-enabled.decorator';
import { FaqsService } from './faqs.service';
import { FaqAIService } from './faq-ai.service';

@ApiTags('FAQs')
@ApiBearerAuth()
@Controller('faqs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ModuleEnabled('faq')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService, private readonly aiService: FaqAIService) {}

  @Get() @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  @ApiOperation({ summary: 'List FAQs.' })
  findAll(@Query() query: { search?: string; status?: string; categoryId?: string; isFeatured?: string; page?: string; limit?: string }) {
    return this.faqsService.findAll({ ...query, page: query.page ? +query.page : undefined, limit: query.limit ? +query.limit : undefined });
  }

  @Get(':id') @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  findOne(@Param('id') id: string) { return this.faqsService.findOne(id); }

  @Post() @Roles('Super Admin', 'Admin', 'Editor')
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.faqsService.create(dto, user); }

  @Put(':id') @Roles('Super Admin', 'Admin', 'Editor')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.faqsService.update(id, dto, user); }

  @Delete(':id') @Roles('Super Admin', 'Admin')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.faqsService.remove(id, user); }

  @Post(':id/publish') @Roles('Super Admin', 'Admin', 'Publisher')
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.faqsService.publish(id, user); }

  @Post(':id/archive') @Roles('Super Admin', 'Admin')
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.faqsService.archive(id, user); }

  @Patch('reorder') @Roles('Super Admin', 'Admin', 'Editor')
  reorder(@Body() body: { items: { id: string; sortOrder: number }[] }) { return this.faqsService.reorder(body.items); }

  @Post('ai/generate') @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'AI generate FAQs.' })
  aiGenerate(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.aiService.generateFaqs(dto, user); }

  @Post('ai/generate-from-content') @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'AI generate FAQs from content.' })
  aiGenerateFromContent(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.aiService.generateFromContent(dto, user); }
}
