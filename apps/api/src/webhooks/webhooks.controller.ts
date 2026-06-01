import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks & Integrations')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Get('integrations/summary')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get integrations summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('webhooks')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List webhook endpoints.' })
  list() { return this.service.list(); }

  @Get('webhooks/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get webhook endpoint.' })
  getById(@Param('id') id: string) { return this.service.getById(id); }

  @Post('webhooks')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create webhook endpoint.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(body, user); }

  @Put('webhooks/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update webhook endpoint.' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, body, user); }

  @Delete('webhooks/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete webhook endpoint.' })
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteEndpoint(id, user); }

  @Post('webhooks/:id/test')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Test webhook endpoint.' })
  test(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.testEndpoint(id, user); }

  @Patch('webhooks/:id/status')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Enable/disable webhook.' })
  toggleStatus(@Param('id') id: string, @Body() body: { isEnabled: boolean }, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, { isEnabled: body.isEnabled }, user); }

  @Get('webhooks/deliveries')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List webhook deliveries.' })
  listDeliveries(@Query('status') status?: string, @Query('eventType') eventType?: string) { return this.service.listDeliveries({ status, eventType }); }

  @Post('webhooks/deliveries/:id/retry')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Retry failed delivery.' })
  retryDelivery(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.retryDelivery(id, user); }
}
