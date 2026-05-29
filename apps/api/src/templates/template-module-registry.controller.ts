import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TemplateModuleRegistryService } from './template-module-registry.service';

@ApiTags('Template Modules')
@ApiBearerAuth()
@Controller('template-modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplateModuleRegistryController {
  constructor(private readonly service: TemplateModuleRegistryService) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List all registered modules.' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get module by ID.' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Register a new module.' })
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(dto, user); }

  @Put(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Update module registry entry.' })
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, dto, user); }

  @Patch(':id/status')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Activate/deactivate module.' })
  updateStatus(@Param('id') id: string, @Body() body: { isActive: boolean }, @CurrentUser() user: AuthenticatedUser) { return this.service.updateStatus(id, body.isActive, user); }

  @Patch(':id/public-visibility')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Enable/disable module for public portal.' })
  updatePublicVisibility(@Param('id') id: string, @Body() body: { isPublicEnabled: boolean }, @CurrentUser() user: AuthenticatedUser) { return this.service.updatePublicVisibility(id, body.isPublicEnabled, user); }

  @Delete(':id')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Delete non-system module.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.remove(id, user); }
}
