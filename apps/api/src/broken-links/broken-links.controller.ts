import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { BrokenLinksService } from './broken-links.service';

@ApiTags('Broken Links')
@ApiBearerAuth()
@Controller('broken-links')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrokenLinksController {
  constructor(
    private readonly service: BrokenLinksService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('summary')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get broken links summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('settings')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get broken link checker settings.' })
  getSettings() { return this.service.getOrCreateSettings(); }

  @Put('settings')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update broken link checker settings.' })
  async updateSettings(@Body() body: any) {
    const settings = await this.service.getOrCreateSettings();
    return this.prisma.brokenLinkSettings.update({ where: { id: settings.id }, data: body });
  }

  @Get('scans')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List broken link scans.' })
  listScans() { return this.service.listScans(); }

  @Get('scans/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get scan details with issues.' })
  getScan(@Param('id') id: string) { return this.service.getScan(id); }

  @Post('scans/run')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run full site broken link scan.' })
  runScan(@CurrentUser() user: AuthenticatedUser) { return this.service.runFullSiteScan(user); }

  @Get('issues')
  @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List broken link issues.' })
  listIssues(@Query('severity') severity?: string, @Query('issueType') issueType?: string, @Query('status') status?: string) {
    return this.service.listIssues({ severity, issueType, status });
  }

  @Patch('issues/:id/status')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update issue status.' })
  updateIssueStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateIssueStatus(id, body.status);
  }
}
