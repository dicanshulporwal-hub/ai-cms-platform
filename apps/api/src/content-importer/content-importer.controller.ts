import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ModuleEnabled } from '../modules/module-enabled.decorator';
import { ContentImporterService, UploadedImportFile } from './content-importer.service';
import {
  ContentImportAssetQueryDto,
  ContentImportItemQueryDto,
  ContentImportListQueryDto,
  ContentImportLogQueryDto,
  ContentImportRuleQueryDto,
  CreateContentImportJobDto,
  CreateContentImportRuleDto,
  ImportSitemapDto,
  ImportUrlBatchDto,
  ImportUrlDto,
  ReorderContentImportRulesDto,
  TestContentImportRuleDto,
  UpdateContentImportAssetDto,
  UpdateContentImportItemDto,
  UpdateContentImportRuleDto,
  ValidateUrlDto,
} from './dto/content-importer.dto';

@ApiTags('Content Importer')
@ApiBearerAuth()
@Controller('content-importer')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher')
@ModuleEnabled('content_importer')
export class ContentImporterController {
  constructor(private readonly service: ContentImporterService) {}

  @Get('summary')
  @Permissions('content_importer.view')
  @ApiOperation({ summary: 'Get Content Importer dashboard summary.' })
  getSummary() {
    return this.service.getSummary();
  }

  @Get('jobs')
  @Permissions('content_importer.view')
  @ApiOperation({ summary: 'List content import jobs.' })
  listJobs(@Query() query: ContentImportListQueryDto) {
    return this.service.listJobs(query);
  }

  @Post('jobs/upload-word')
  @Permissions('content_importer.upload', 'content_importer.word_import')
  @ApiOperation({ summary: 'Upload a private DOCX file for later extraction.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  uploadWord(
    @UploadedFile() file: UploadedImportFile | undefined,
    @Body() body: CreateContentImportJobDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.uploadWord(file, body, user);
  }

  @Post('jobs/import-url')
  @Permissions('content_importer.web_import')
  @ApiOperation({ summary: 'Create a single public URL import job.' })
  importUrl(@Body() body: ImportUrlDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createUrlJob(body, user);
  }

  @Post('jobs/import-url-batch')
  @Permissions('content_importer.web_batch_import')
  @ApiOperation({ summary: 'Create a capped batch URL import job.' })
  importUrlBatch(@Body() body: ImportUrlBatchDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createBatchJob(body, user);
  }

  @Post('jobs/import-sitemap')
  @Permissions('content_importer.web_sitemap_import')
  @ApiOperation({ summary: 'Create a sitemap import job shell.' })
  importSitemap(@Body() body: ImportSitemapDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createSitemapJob(body, user);
  }

  @Post('web/validate-url')
  @Permissions('content_importer.web_validate')
  @ApiOperation({ summary: 'Validate public URL safety before import.' })
  validateUrl(@Body() body: ValidateUrlDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.validateUrl(body, user);
  }

  @Post('web/check-robots')
  @Permissions('content_importer.web_validate')
  @ApiOperation({ summary: 'Placeholder for robots check in the web extraction slice.' })
  checkRobots(@Body() body: ValidateUrlDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.validateUrl(body, user);
  }

  @Post('web/preview-url')
  @Permissions('content_importer.web_validate')
  @ApiOperation({ summary: 'Placeholder URL preview validation before extraction.' })
  previewUrl(@Body() body: ValidateUrlDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.validateUrl(body, user);
  }

  @Get('jobs/:id/items')
  @Permissions('content_importer.review')
  @ApiOperation({ summary: 'List generated import items for a job.' })
  listItems(@Param('id') id: string, @Query() query: ContentImportItemQueryDto) {
    return this.service.listItems(id, query);
  }

  @Get('jobs/:id/assets')
  @Permissions('content_importer.review')
  @ApiOperation({ summary: 'List extracted import assets for a job.' })
  listAssets(@Param('id') id: string, @Query() query: ContentImportAssetQueryDto) {
    return this.service.listAssets(id, query);
  }

  @Get('jobs/:id/logs')
  @Permissions('content_importer.logs.view')
  @ApiOperation({ summary: 'List logs for an import job.' })
  listJobLogs(@Param('id') id: string, @Query() query: ContentImportLogQueryDto) {
    return this.service.listLogs({ ...query, jobId: id });
  }

  @Get('jobs/:id/web-extraction')
  @Permissions('content_importer.review')
  @ApiOperation({ summary: 'Get web extraction payload for a job.' })
  getWebExtraction(@Param('id') id: string) {
    return this.service.getJob(id);
  }

  @Get('jobs/:id/source-preview')
  @Permissions('content_importer.review')
  @ApiOperation({ summary: 'Get stored source preview for a job.' })
  getSourcePreview(@Param('id') id: string) {
    return this.service.getJob(id);
  }

  @Get('jobs/:id')
  @Permissions('content_importer.view')
  @ApiOperation({ summary: 'Get import job detail.' })
  getJob(@Param('id') id: string) {
    return this.service.getJob(id);
  }

  @Post('jobs/:id/extract')
  @Permissions('content_importer.extract')
  extract(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.extractJob(id, user);
  }

  @Post('jobs/:id/analyze')
  @Permissions('content_importer.ai_analyze')
  analyze(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markJobActionNotReady(id, 'content_import.ai_analysis_started', user);
  }

  @Post('jobs/:id/reprocess')
  @Permissions('content_importer.extract')
  reprocess(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.extractJob(id, user);
  }

  @Post('jobs/:id/fetch-web')
  @Permissions('content_importer.web_import')
  fetchWeb(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.fetchWebJob(id, user);
  }

  @Post('jobs/:id/analyze-web')
  @Permissions('content_importer.ai_analyze')
  analyzeWeb(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markJobActionNotReady(id, 'content_import.web_ai_analysis_started', user);
  }

  @Post('jobs/:id/ai/analyze')
  @Permissions('content_importer.ai_analyze')
  aiAnalyze(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markJobActionNotReady(id, 'content_import.ai_analysis_started', user);
  }

  @Post('jobs/:id/import-approved')
  @Permissions('content_importer.import_bulk')
  importApproved(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.importApprovedItems(id, user);
  }

  @Post('jobs/:id/cancel')
  @Permissions('content_importer.cancel_job')
  cancelJob(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.cancelJob(id, user);
  }

  @Delete('jobs/:id')
  @Permissions('content_importer.delete_job')
  deleteJob(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.deleteJob(id, user);
  }

  @Get('items/:itemId')
  @Permissions('content_importer.review')
  getItem(@Param('itemId') itemId: string) {
    return this.service.getItem(itemId);
  }

  @Put('items/:itemId')
  @Permissions('content_importer.review')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() body: UpdateContentImportItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateItem(itemId, body, user);
  }

  @Post('items/:itemId/approve')
  @Permissions('content_importer.approve_item')
  approveItem(@Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.approveItem(itemId, user);
  }

  @Post('items/:itemId/skip')
  @Permissions('content_importer.review')
  skipItem(@Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.skipItem(itemId, user);
  }

  @Post('items/:itemId/import')
  @Permissions('content_importer.import_item')
  importItem(@Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.importItem(itemId, user);
  }

  @Post('items/:itemId/ai/improve')
  @Permissions('content_importer.ai_analyze')
  improveItem(@Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markItemActionNotReady(itemId, 'content_import.item_ai_improve_started', user);
  }

  @Post('items/:itemId/ai/generate-seo')
  @Permissions('content_importer.ai_analyze')
  generateSeo(@Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markItemActionNotReady(itemId, 'content_import.item_ai_seo_started', user);
  }

  @Put('assets/:assetId')
  @Permissions('content_importer.review')
  updateAsset(
    @Param('assetId') assetId: string,
    @Body() body: UpdateContentImportAssetDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateAsset(assetId, body, user);
  }

  @Post('assets/:assetId/save-to-media')
  @Permissions('content_importer.web_image_import')
  saveAssetToMedia(@Param('assetId') assetId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markAssetSaveNotReady(assetId, user);
  }

  @Post('assets/:assetId/import-web-image')
  @Permissions('content_importer.web_image_import')
  importWebImage(@Param('assetId') assetId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markAssetSaveNotReady(assetId, user);
  }

  @Get('rules')
  @Permissions('content_importer.rules.view')
  listRules(@Query() query: ContentImportRuleQueryDto) {
    return this.service.listRules(query);
  }

  @Post('rules')
  @Permissions('content_importer.rules.create')
  createRule(@Body() body: CreateContentImportRuleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createRule(body, user);
  }

  @Patch('rules/reorder')
  @Permissions('content_importer.rules.update')
  reorderRules(@Body() body: ReorderContentImportRulesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.reorderRules(body, user);
  }

  @Get('rules/:id')
  @Permissions('content_importer.rules.view')
  getRule(@Param('id') id: string) {
    return this.service.getRule(id);
  }

  @Put('rules/:id')
  @Permissions('content_importer.rules.update')
  updateRule(
    @Param('id') id: string,
    @Body() body: UpdateContentImportRuleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateRule(id, body, user);
  }

  @Delete('rules/:id')
  @Permissions('content_importer.rules.delete')
  deleteRule(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.deleteRule(id, user);
  }

  @Post('rules/:id/test')
  @Permissions('content_importer.rules.view')
  testRule(@Param('id') id: string, @Body() body: TestContentImportRuleDto) {
    return this.service.testRule(id, body);
  }

  @Get('logs')
  @Permissions('content_importer.logs.view')
  listLogs(@Query() query: ContentImportLogQueryDto) {
    return this.service.listLogs(query);
  }
}
