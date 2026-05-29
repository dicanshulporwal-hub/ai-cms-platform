import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TemplateLayoutService } from './template-layout.service';

@ApiTags('Template Layout')
@ApiBearerAuth()
@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplateLayoutController {
  constructor(private readonly layoutService: TemplateLayoutService) {}

  @Get(':id/regions')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get template regions with modules.' })
  getRegions(@Param('id') id: string) { return this.layoutService.getRegions(id); }

  @Post(':id/regions')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create a region.' })
  createRegion(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.layoutService.createRegion(id, dto, user); }

  @Put(':id/regions/:regionId')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update a region.' })
  updateRegion(@Param('id') id: string, @Param('regionId') regionId: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.layoutService.updateRegion(id, regionId, dto, user); }

  @Delete(':id/regions/:regionId')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete a region.' })
  deleteRegion(@Param('id') id: string, @Param('regionId') regionId: string, @CurrentUser() user: AuthenticatedUser) { return this.layoutService.deleteRegion(id, regionId, user); }

  @Get(':id/region-modules')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get all modules across regions.' })
  getRegionModules(@Param('id') id: string) { return this.layoutService.getRegionModules(id); }

  @Post(':id/regions/:regionId/modules')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Add module to region.' })
  addModule(@Param('id') id: string, @Param('regionId') regionId: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.layoutService.addModule(id, regionId, dto, user); }

  @Put(':id/regions/:regionId/modules/:moduleId')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update module in region.' })
  updateModule(@Param('id') id: string, @Param('regionId') regionId: string, @Param('moduleId') moduleId: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) { return this.layoutService.updateModule(id, regionId, moduleId, dto, user); }

  @Delete(':id/regions/:regionId/modules/:moduleId')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Remove module from region.' })
  deleteModule(@Param('id') id: string, @Param('regionId') regionId: string, @Param('moduleId') moduleId: string, @CurrentUser() user: AuthenticatedUser) { return this.layoutService.deleteModule(id, regionId, moduleId, user); }

  @Get(':id/preview-data')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get template preview data.' })
  getPreviewData(@Param('id') id: string) { return this.layoutService.getPreviewData(id); }
}
