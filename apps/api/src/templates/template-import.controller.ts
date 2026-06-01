import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TemplateImportService } from './template-import.service';

@ApiTags('Template Import')
@ApiBearerAuth()
@Controller('templates/import-html')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplateImportController {
  constructor(private readonly importService: TemplateImportService) {}

  @Get('jobs')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List import jobs.' })
  listJobs(@CurrentUser() user: AuthenticatedUser) {
    return this.importService.listJobs();
  }

  @Post('upload')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Upload HTML template ZIP for import.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  uploadZip(
    @UploadedFile() file: any,
    @Body() body: { sourceUrl?: string; licenseName?: string; licenseUrl?: string; attributionText?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.importService.createZipJob(file, body, user);
  }

  @Post('paste')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Paste HTML/CSS code for import.' })
  pasteCode(
    @Body() body: { html: string; css?: string; sourceUrl?: string; licenseName?: string; licenseUrl?: string; attributionText?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.importService.createPasteJob(body, user);
  }

  @Get('jobs/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get import job details.' })
  getJob(@Param('id') id: string) {
    return this.importService.getJob(id);
  }

  @Post('jobs/:id/convert')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Convert imported HTML to CMS template format.' })
  convertJob(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.importService.convertJob(id, user);
  }

  @Post('jobs/:id/save-as-template')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Save converted import as draft template.' })
  saveAsTemplate(
    @Param('id') id: string,
    @Body() body: { name?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.importService.saveAsTemplate(id, body, user);
  }

  @Delete('jobs/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete an import job.' })
  deleteJob(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.importService.deleteJob(id, user);
  }
}
