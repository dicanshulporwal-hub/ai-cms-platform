import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ModuleEnabled } from '../modules/module-enabled.decorator';
import { FormSubmissionsService } from './form-submissions.service';

@ApiTags('Form Submissions')
@ApiBearerAuth()
@Controller('form-submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ModuleEnabled('forms')
export class FormSubmissionsController {
  constructor(private readonly service: FormSubmissionsService) {}

  @Get(':id') @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer')
  @ApiOperation({ summary: 'Get submission.' })
  getSubmission(@Param('id') id: string) { return this.service.getSubmission(id); }

  @Patch(':id/status') @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update submission status.' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) { return this.service.updateStatus(id, body.status); }

  @Post(':id/notes') @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Add note to submission.' })
  addNote(@Param('id') id: string, @Body() body: { note: string }, @CurrentUser() user: AuthenticatedUser) { return this.service.addNote(id, body.note, user.id); }

  @Delete(':id') @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete submission.' })
  deleteSubmission(@Param('id') id: string) { return this.service.deleteSubmission(id); }
}
