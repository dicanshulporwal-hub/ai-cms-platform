import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TendersService } from './tenders.service';

@ApiTags('Tenders')
@Controller()
export class TendersController {
  constructor(private readonly service: TendersService) {}

  // === PUBLIC ===
  @Get('public/tenders')
  @ApiOperation({ summary: 'List published tenders (public).' })
  publicList(@Query('type') type?: string, @Query('search') search?: string, @Query('archive') archive?: string) { return this.service.publicList({ procurementType: type, search, archive: archive === 'true' }); }

  @Get('public/tenders/:slug')
  @ApiOperation({ summary: 'Get tender by slug (public).' })
  publicGet(@Param('slug') slug: string) { return this.service.publicGetBySlug(slug); }

  @Get('public/tender-categories')
  @ApiOperation({ summary: 'List tender categories (public).' })
  publicCategories() { return this.service.listCategories(); }

  // === ADMIN ===
  @Get('tenders/summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  getSummary() { return this.service.getSummary(); }

  @Get('tenders')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  list(@Query('status') status?: string, @Query('categoryId') categoryId?: string, @Query('type') type?: string, @Query('search') search?: string) { return this.service.list({ status, categoryId, procurementType: type, search }); }

  @Get('tenders/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  getById(@Param('id') id: string) { return this.service.getById(id); }

  @Post('tenders')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(body, user); }

  @Put('tenders/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, body, user); }

  @Post('tenders/:id/publish')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Publisher')
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.publish(id, user); }

  @Post('tenders/:id/close')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  close(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.close(id, user); }

  @Post('tenders/:id/archive')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  archive(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.archive(id, user); }

  @Delete('tenders/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteTender(id, user); }

  @Post('tenders/:id/corrigenda')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  addCorrigendum(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.addCorrigendum(id, body, user); }

  @Post('tender-corrigenda/:id/publish')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Publisher')
  publishCorrigendum(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.publishCorrigendum(id, user); }

  // === CATEGORIES ===
  @Get('tender-categories')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listCategories() { return this.service.listCategories(); }

  @Post('tender-categories')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createCategory(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createCategory(body, user); }

  @Delete('tender-categories/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteCategory(@Param('id') id: string) { return this.service.deleteCategory(id); }
}
