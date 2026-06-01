import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AccessibilityService } from './accessibility.service';

@ApiTags('Accessibility')
@ApiBearerAuth()
@Controller('accessibility')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessibilityController {
  constructor(private readonly service: AccessibilityService) {}

  @Get('summary')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get accessibility summary stats.' })
  getSummary() {
    return this.service.getSummary();
  }

  @Get('audits')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List accessibility audits.' })
  listAudits() {
    return this.service.listAudits();
  }

  @Get('audits/:id')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get audit details with issues.' })
  getAudit(@Param('id') id: string) {
    return this.service.getAudit(id);
  }

  @Post('audits/run-full-site')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run full site accessibility audit.' })
  runFullSite(@CurrentUser() user: AuthenticatedUser) {
    return this.service.runFullSiteAudit(user);
  }

  @Post('audits/run-template/:templateId')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run accessibility audit on a template.' })
  runTemplate(@Param('templateId') templateId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.runTemplateAudit(templateId, user);
  }

  @Post('audits/run-page/:pageId')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run accessibility audit on a page.' })
  runPage(@Param('pageId') pageId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.runPageAudit(pageId, user);
  }

  @Get('issues')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List accessibility issues with filters.' })
  getIssues(@Query('severity') severity?: string, @Query('category') category?: string, @Query('auditId') auditId?: string) {
    return this.service.getIssues({ severity, category, auditId });
  }
}
