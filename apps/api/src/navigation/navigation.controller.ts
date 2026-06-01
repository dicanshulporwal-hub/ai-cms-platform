import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { NavigationService } from './navigation.service';

@ApiTags('Navigation / Menus')
@Controller()
export class NavigationController {
  constructor(private readonly service: NavigationService) {}

  // === PUBLIC (no auth) ===
  @Get('public/menus')
  @ApiOperation({ summary: 'List active public menus.' })
  publicMenus() { return this.service.getPublicMenus(); }

  @Get('public/menus/location/:location')
  @ApiOperation({ summary: 'Get active menu by location.' })
  publicByLocation(@Param('location') location: string, @Query('lang') lang?: string) { return this.service.getPublicMenuByLocation(location, lang); }

  // === ADMIN ===
  @Get('menus/summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get menu summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('menus')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List menus.' })
  list() { return this.service.listMenus(); }

  @Get('menus/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get menu with items.' })
  getById(@Param('id') id: string) { return this.service.getMenu(id); }

  @Post('menus')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create menu.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createMenu(body, user); }

  @Put('menus/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update menu.' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.updateMenu(id, body, user); }

  @Post('menus/:id/activate')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Activate menu.' })
  activate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.activateMenu(id, user); }

  @Delete('menus/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete menu.' })
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteMenu(id, user); }

  @Post('menus/:id/items')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Add menu item.' })
  addItem(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.addItem(id, body, user); }

  @Put('menus/:id/items/:itemId')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update menu item.' })
  updateItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.updateItem(id, itemId, body, user); }

  @Delete('menus/:id/items/:itemId')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete menu item.' })
  deleteItem(@Param('id') id: string, @Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteItem(id, itemId, user); }

  @Patch('menus/:id/items/reorder')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Reorder menu items.' })
  reorder(@Param('id') id: string, @Body() body: { items: { id: string; sortOrder: number }[] }, @CurrentUser() user: AuthenticatedUser) { return this.service.reorderItems(id, body.items, user); }
}
