import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { DocumentsService } from './documents.service';
import { DocumentAIService } from './document-ai.service';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly documentAIService: DocumentAIService,
  ) {}

  @Get()
  @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  @ApiOperation({ summary: 'List documents.' })
  findAll(@Query() query: { search?: string; status?: string; categoryId?: string; documentType?: string; page?: string; limit?: string }) {
    return this.documentsService.findAll({ ...query, page: query.page ? +query.page : undefined, limit: query.limit ? +query.limit : undefined });
  }

  @Get(':id')
  @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  @ApiOperation({ summary: 'Get document by ID.' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post('upload')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Upload a document.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  upload(@UploadedFile() file: any, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.upload(file, user);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Update document metadata.' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete a document.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.remove(id, user);
  }

  @Post(':id/publish')
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Publish a document.' })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.publish(id, user);
  }

  @Post(':id/archive')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Archive a document.' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.archive(id, user);
  }

  @Post(':id/generate-metadata')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Generate AI metadata for a document.' })
  generateMetadata(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentAIService.generateMetadata(id, user);
  }

  @Get(':id/metadata-job/:jobId')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get metadata generation job status.' })
  getMetadataJob(@Param('id') id: string, @Param('jobId') jobId: string) {
    return this.documentAIService.getJob(id, jobId);
  }

  @Post(':id/apply-ai-metadata')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Apply AI-generated metadata to document.' })
  applyAIMetadata(@Param('id') id: string, @Body() body: { jobId: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.applyAIMetadata(id, body.jobId, user);
  }
}
