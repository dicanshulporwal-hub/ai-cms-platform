import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { DeploymentService } from './deployment.service';

@ApiTags('Deployment')
@ApiBearerAuth()
@Controller('deployment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeploymentController {
  constructor(private readonly service: DeploymentService) {}

  @Get('summary')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get deployment summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('environments')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List environments.' })
  listEnvironments() { return this.service.listEnvironments(); }

  @Get('environments/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get environment.' })
  getEnvironment(@Param('id') id: string) { return this.service.getEnvironment(id); }

  @Post('environments')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create environment.' })
  createEnvironment(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createEnvironment(body, user); }

  @Put('environments/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update environment.' })
  updateEnvironment(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.updateEnvironment(id, body, user); }

  @Delete('environments/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete environment.' })
  deleteEnvironment(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteEnvironment(id, user); }

  @Patch('environments/:id/default')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Set default environment.' })
  setDefault(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.setDefault(id, user); }

  @Post('environments/:id/readiness/run')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Run readiness check.' })
  runReadiness(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.runReadinessCheck(id, user); }

  @Get('checklist')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get deployment checklist.' })
  getChecklist() { return this.service.getChecklist(); }

  @Post('checklist/seed')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Seed default checklist items.' })
  seedChecklist() { return this.service.seedChecklist(); }

  @Get('logs')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get deployment logs.' })
  getLogs() { return this.service.getLogs(); }

  @Post('environments/:id/logs')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create deployment log.' })
  createLog(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createLog(id, body, user); }
}
