import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ApiAccessService } from './api-access.service';

@ApiTags('API Access')
@ApiBearerAuth()
@Controller('api-access')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiAccessController {
  constructor(private readonly service: ApiAccessService) {}

  @Get('summary')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get API access summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('scopes')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get available API scopes.' })
  getScopes() { return this.service.getAvailableScopes(); }

  @Get('clients')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List API clients.' })
  listClients() { return this.service.listClients(); }

  @Get('clients/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get API client.' })
  getClient(@Param('id') id: string) { return this.service.getClient(id); }

  @Post('clients')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create API client (returns key once).' })
  createClient(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createClient(body, user); }

  @Put('clients/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update API client.' })
  updateClient(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.updateClient(id, body, user); }

  @Patch('clients/:id/revoke')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Revoke API client.' })
  revokeClient(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.revokeClient(id, user); }

  @Delete('clients/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete API client.' })
  deleteClient(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteClient(id, user); }

  @Get('logs')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List API access logs.' })
  listLogs() { return this.service.listLogs(); }

  @Get('clients/:id/logs')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List logs for a client.' })
  clientLogs(@Param('id') id: string) { return this.service.listLogs(id); }
}
