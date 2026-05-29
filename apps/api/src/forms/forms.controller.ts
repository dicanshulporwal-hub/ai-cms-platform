import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ModuleEnabled } from '../modules/module-enabled.decorator';
import { FormsService } from './forms.service';
import { FormFieldsService } from './form-fields.service';
import { FormAIService } from './form-ai.service';

@ApiTags('Forms')
@ApiBearerAuth()
@Controller('forms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ModuleEnabled('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService, private readonly fieldsService: FormFieldsService, private readonly aiService: FormAIService) {}

  @Get() @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'List forms.' })
  findAll(@Query() query: { search?: string; status?: string; formType?: string }) { return this.formsService.findAll(query); }

  @Get(':id') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Get form.' })
  findOne(@Param('id') id: string) { return this.formsService.findOne(id); }

  @Post() @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Create form.' })
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.formsService.create(dto, user); }

  @Put(':id') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Update form.' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.formsService.update(id, dto, user); }

  @Delete(':id') @Roles('Super Admin', 'Admin') @ApiOperation({ summary: 'Delete form.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.formsService.remove(id, user); }

  @Post(':id/publish') @Roles('Super Admin', 'Admin', 'Publisher') @ApiOperation({ summary: 'Publish form.' })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.formsService.publish(id, user); }

  @Post(':id/archive') @Roles('Super Admin', 'Admin') @ApiOperation({ summary: 'Archive form.' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.formsService.archive(id, user); }

  // Fields
  @Get(':id/fields') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Get form fields.' })
  getFields(@Param('id') id: string) { return this.fieldsService.getFields(id); }

  @Post(':id/fields') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Add field.' })
  addField(@Param('id') id: string, @Body() dto: any) { return this.fieldsService.addField(id, dto); }

  @Put(':id/fields/:fieldId') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Update field.' })
  updateField(@Param('id') id: string, @Param('fieldId') fieldId: string, @Body() dto: any) { return this.fieldsService.updateField(id, fieldId, dto); }

  @Delete(':id/fields/:fieldId') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Delete field.' })
  deleteField(@Param('id') id: string, @Param('fieldId') fieldId: string) { return this.fieldsService.deleteField(id, fieldId); }

  @Patch(':id/fields/reorder') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'Reorder fields.' })
  reorderFields(@Param('id') id: string, @Body() body: { fieldIds: string[] }) { return this.fieldsService.reorderFields(id, body.fieldIds); }

  // AI
  @Post('ai/generate') @Roles('Super Admin', 'Admin', 'Editor') @ApiOperation({ summary: 'AI generate form.' })
  aiGenerate(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.aiService.generateForm(dto, user); }
}
