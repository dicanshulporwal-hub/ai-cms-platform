import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AnnouncementsService } from './announcements.service';

@ApiTags('Announcements')
@Controller()
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  // === PUBLIC ===
  @Get('public/announcements')
  @ApiOperation({ summary: 'List published announcements (public).' })
  publicList(@Query('type') type?: string, @Query('category') categorySlug?: string, @Query('search') search?: string) { return this.service.publicList({ type, categorySlug, search }); }

  @Get('public/announcements/:slug')
  @ApiOperation({ summary: 'Get announcement by slug (public).' })
  publicGet(@Param('slug') slug: string) { return this.service.publicGetBySlug(slug); }

  @Get('public/announcement-categories')
  @ApiOperation({ summary: 'List announcement categories (public).' })
  publicCategories() { return this.service.listCategories(); }

  // === ADMIN ===
  @Get('announcements/summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get announcements summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('announcements')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'List announcements.' })
  list(@Query('status') status?: string, @Query('type') type?: string, @Query('categoryId') categoryId?: string, @Query('search') search?: string) { return this.service.list({ status, type, categoryId, search }); }

  @Get('announcements/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Get announcement.' })
  getById(@Param('id') id: string) { return this.service.getById(id); }

  @Post('announcements')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Create announcement.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(body, user); }

  @Put('announcements/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Update announcement.' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, body, user); }

  @Post('announcements/:id/publish')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Publish announcement.' })
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.publish(id, user); }

  @Post('announcements/:id/archive')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Archive announcement.' })
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.archive(id, user); }

  @Delete('announcements/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete announcement.' })
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteAnnouncement(id, user); }

  @Patch('announcements/:id/pin')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Toggle pin.' })
  pin(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.togglePin(id, user); }

  @Patch('announcements/:id/important')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Toggle important.' })
  important(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.toggleImportant(id, user); }

  // === CATEGORIES ===
  @Get('announcement-categories')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List categories.' })
  listCategories() { return this.service.listCategories(); }

  @Post('announcement-categories')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create category.' })
  createCategory(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createCategory(body, user); }

  @Put('announcement-categories/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update category.' })
  updateCategory(@Param('id') id: string, @Body() body: any) { return this.service.updateCategory(id, body); }

  @Delete('announcement-categories/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete category.' })
  deleteCategory(@Param('id') id: string) { return this.service.deleteCategory(id); }
}
