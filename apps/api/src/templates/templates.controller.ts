import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateTemplateDto, AIGenerateTemplateDto } from './dto/create-template.dto';
import { TemplatesService } from './templates.service';
import { AITemplateService } from './ai-template.service';

@ApiTags('Templates')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
  constructor(
    private readonly templatesService: TemplatesService,
    private readonly aiTemplateService: AITemplateService,
  ) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List all templates.' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Get('active/current')
  @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  @ApiOperation({ summary: 'Get currently active template.' })
  getActive() {
    return this.templatesService.getActiveTemplate();
  }

  @Get(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get template by ID.' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Post('upload')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Upload a template ZIP package.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  upload(
    @UploadedFile() file: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.templatesService.upload(file, user);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update template metadata.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.templatesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete a template.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.templatesService.remove(id, user);
  }

  @Post(':id/activate')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Activate a template for the public website.' })
  activate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.templatesService.activate(id, user);
  }

  @Post(':id/deactivate')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Deactivate a template.' })
  deactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.templatesService.deactivate(id, user);
  }

  @Post(':id/run-compliance-check')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run UX4G/GIGW readiness compliance check.' })
  runComplianceCheck(@Param('id') id: string) {
    return this.templatesService.runComplianceCheck(id);
  }

  @Get(':id/compliance-report')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get compliance report for a template.' })
  getComplianceReport(@Param('id') id: string) {
    return this.templatesService.getComplianceReport(id);
  }

  @Post('ai/generate-from-screenshot')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Generate template from screenshot using AI.' })
  aiGenerate(
    @Body() dto: AIGenerateTemplateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiTemplateService.generateFromScreenshot(
      undefined,
      dto.prompt,
      dto.templateType ?? 'GOVERNMENT',
      user,
    );
  }

  @Get('ai/generation-jobs/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get AI generation job status.' })
  getGenerationJob(@Param('id') id: string) {
    return this.aiTemplateService.getJob(id);
  }

  @Post('ai/generation-jobs/:id/save-as-template')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Save AI generation result as draft template.' })
  saveAsTemplate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiTemplateService.saveAsTemplate(id, user);
  }
}
