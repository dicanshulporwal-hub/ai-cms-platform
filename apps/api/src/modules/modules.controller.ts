import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ModuleRegistryService } from './module-registry.service';

@ApiTags('Modules')
@ApiBearerAuth()
@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly moduleRegistry: ModuleRegistryService) {}

  @Get()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List all registered modules.' })
  findAll(@Query() query: { category?: string; isEnabled?: string }) {
    return this.moduleRegistry.findAll({ category: query.category, isEnabled: query.isEnabled === 'true' ? true : query.isEnabled === 'false' ? false : undefined });
  }

  @Get('enabled')
  @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  @ApiOperation({ summary: 'Get enabled modules.' })
  getEnabled() { return this.moduleRegistry.getEnabledModules(); }

  @Get('sidebar')
  @Roles('Super Admin', 'Admin', 'Editor', 'Reviewer', 'Publisher', 'Viewer')
  @ApiOperation({ summary: 'Get sidebar-visible modules.' })
  getSidebar() { return this.moduleRegistry.getSidebarModules(); }

  @Get('public-enabled')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get public-enabled modules.' })
  getPublicEnabled() { return this.moduleRegistry.getPublicEnabledModules(); }

  @Get('template-available')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get template-available modules.' })
  getTemplateAvailable() { return this.moduleRegistry.getTemplateAvailableModules(); }

  @Get(':moduleKey')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get module by key.' })
  findOne(@Param('moduleKey') moduleKey: string) { return this.moduleRegistry.findOne(moduleKey); }

  @Post()
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Register a new module.' })
  register(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.moduleRegistry.registerModule(dto, user); }

  @Put(':moduleKey')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Update module.' })
  update(@Param('moduleKey') moduleKey: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.moduleRegistry.updateModule(moduleKey, dto, user); }

  @Patch(':moduleKey/enable')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Enable module.' })
  enable(@Param('moduleKey') moduleKey: string, @CurrentUser() user: AuthenticatedUser) { return this.moduleRegistry.enableModule(moduleKey, user); }

  @Patch(':moduleKey/disable')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Disable module.' })
  disable(@Param('moduleKey') moduleKey: string, @CurrentUser() user: AuthenticatedUser) { return this.moduleRegistry.disableModule(moduleKey, user); }

  @Patch(':moduleKey/admin-visibility')
  @Roles('Super Admin')
  @ApiOperation({ summary: 'Toggle admin visibility.' })
  adminVisibility(@Param('moduleKey') moduleKey: string, @Body() body: { isAdminVisible: boolean }, @CurrentUser() user: AuthenticatedUser) { return this.moduleRegistry.updateAdminVisibility(moduleKey, body.isAdminVisible, user); }

  @Patch(':moduleKey/public-visibility')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Toggle public visibility.' })
  publicVisibility(@Param('moduleKey') moduleKey: string, @Body() body: { isPublicEnabled: boolean }, @CurrentUser() user: AuthenticatedUser) { return this.moduleRegistry.updatePublicVisibility(moduleKey, body.isPublicEnabled, user); }

  @Patch(':moduleKey/template-availability')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Toggle template availability.' })
  templateAvailability(@Param('moduleKey') moduleKey: string, @Body() body: { isTemplateAvailable: boolean }, @CurrentUser() user: AuthenticatedUser) { return this.moduleRegistry.updateTemplateAvailability(moduleKey, body.isTemplateAvailable, user); }
}
