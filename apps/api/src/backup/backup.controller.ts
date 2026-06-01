import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BackupService } from './backup.service';

@ApiTags('Backup & Restore')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackupController {
  constructor(private readonly service: BackupService) {}

  @Get('backup-manager/summary')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get backup manager summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('backups')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List backup jobs.' })
  listBackups() { return this.service.listJobs(); }

  @Get('backups/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get backup job details.' })
  getBackup(@Param('id') id: string) { return this.service.getJob(id); }

  @Post('backups/create')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create a new backup.' })
  createBackup(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createBackup(body, user); }

  @Post('backups/:id/download')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Download backup file.' })
  async downloadBackup(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: AuthenticatedUser) {
    const { filePath, fileName } = await this.service.downloadBackup(id, user);
    res.download(filePath, fileName || 'backup.json');
  }

  @Delete('backups/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete a backup.' })
  deleteBackup(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteJob(id, user); }

  @Post('exports/create')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Export content.' })
  createExport(@Body() body: { exportType: string }, @CurrentUser() user: AuthenticatedUser) { return this.service.exportContent(body.exportType, user); }

  @Get('exports')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List export jobs.' })
  listExports() { return this.service.listExports(); }
}
