import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SchemeServicesService } from './scheme-services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Schemes & Services')
@Controller()
export class SchemeServicesController {
  constructor(private readonly service: SchemeServicesService) {}

  // === PUBLIC ===
  @Get('public/schemes')
  @ApiOperation({ summary: 'List published schemes.' })
  publicSchemes(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string, @Query('category') category?: string, @Query('department') department?: string, @Query('applicationMode') applicationMode?: string) {
    return this.service.getPublicList({ page: page ? +page : undefined, limit: limit ? +limit : undefined, type: 'SCHEME', categorySlug: category, departmentSlug: department, search, applicationMode });
  }

  @Get('public/services')
  @ApiOperation({ summary: 'List published services.' })
  publicServices(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string, @Query('category') category?: string, @Query('department') department?: string, @Query('applicationMode') applicationMode?: string) {
    return this.service.getPublicList({ page: page ? +page : undefined, limit: limit ? +limit : undefined, type: 'SERVICE', categorySlug: category, departmentSlug: department, search, applicationMode });
  }

  @Get('public/schemes/:slug')
  @ApiOperation({ summary: 'Get published scheme by slug.' })
  publicSchemeBySlug(@Param('slug') slug: string) { return this.service.getPublicBySlug(slug); }

  @Get('public/services/:slug')
  @ApiOperation({ summary: 'Get published service by slug.' })
  publicServiceBySlug(@Param('slug') slug: string) { return this.service.getPublicBySlug(slug); }

  @Get('public/scheme-service-categories')
  @ApiOperation({ summary: 'List active categories (public).' })
  publicCategories() { return this.service.getPublicCategories(); }

  @Get('public/departments')
  @ApiOperation({ summary: 'List active departments (public).' })
  publicDepartments() { return this.service.getPublicDepartments(); }

  // === ADMIN ===
  @Get('scheme-services/summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Summary stats.' })
  getSummary() { return this.service.getSummary(); }

  @Get('scheme-services')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'List all schemes/services (admin).' })
  list(@Query('page') page?: string, @Query('limit') limit?: string, @Query('type') type?: string, @Query('status') status?: string, @Query('categoryId') categoryId?: string, @Query('departmentId') departmentId?: string, @Query('search') search?: string, @Query('sort') sort?: string) {
    return this.service.list({ page: page ? +page : undefined, limit: limit ? +limit : undefined, type, status, categoryId, departmentId, search, sort });
  }

  @Get('scheme-services/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Get by ID.' })
  getById(@Param('id') id: string) { return this.service.getById(id); }

  @Post('scheme-services')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Create scheme/service.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(body, user.id); }

  @Put('scheme-services/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Update scheme/service.' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, body, user.id); }

  @Delete('scheme-services/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete.' })
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @Post('scheme-services/:id/submit-review')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  @ApiOperation({ summary: 'Submit for review.' })
  submitReview(@Param('id') id: string) { return this.service.submitReview(id); }

  @Post('scheme-services/:id/approve')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Approve.' })
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.approve(id, user.id); }

  @Post('scheme-services/:id/publish')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Publish.' })
  publish(@Param('id') id: string) { return this.service.publish(id); }

  @Post('scheme-services/:id/archive')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Archive.' })
  archive(@Param('id') id: string) { return this.service.archive(id); }

  // === CATEGORIES ===
  @Get('scheme-service-categories')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listCategories() { return this.service.listCategories(); }

  @Post('scheme-service-categories')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createCategory(@Body() body: any) { return this.service.createCategory(body); }

  @Put('scheme-service-categories/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateCategory(@Param('id') id: string, @Body() body: any) { return this.service.updateCategory(id, body); }

  @Delete('scheme-service-categories/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteCategory(@Param('id') id: string) { return this.service.deleteCategory(id); }

  // === DEPARTMENTS ===
  @Get('departments')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listDepartments() { return this.service.listDepartments(); }

  @Post('departments')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createDepartment(@Body() body: any) { return this.service.createDepartment(body); }

  @Put('departments/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateDepartment(@Param('id') id: string, @Body() body: any) { return this.service.updateDepartment(id, body); }

  @Delete('departments/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteDepartment(@Param('id') id: string) { return this.service.deleteDepartment(id); }
}
