import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContactDirectoryService } from './contact-directory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Contact Directory')
@Controller()
export class ContactDirectoryController {
  constructor(private readonly service: ContactDirectoryService) {}

  // === PUBLIC ===
  @Get('public/contact-directory')
  @ApiOperation({ summary: 'Public contact directory.' })
  publicDirectory(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string, @Query('departmentId') departmentId?: string, @Query('designationId') designationId?: string) {
    return this.service.getPublicContactDirectory({ page: page ? +page : undefined, limit: limit ? +limit : undefined, search, departmentId, designationId });
  }

  @Get('public/departments-directory')
  @ApiOperation({ summary: 'Public departments list.' })
  publicDepartments() { return this.service.getPublicDepartments(); }

  @Get('public/departments-directory/tree')
  @ApiOperation({ summary: 'Public department tree.' })
  publicTree() { return this.service.getDepartmentTree(); }

  @Get('public/departments-directory/:slug')
  @ApiOperation({ summary: 'Public department by slug.' })
  publicDeptBySlug(@Param('slug') slug: string) { return this.service.getPublicDepartmentBySlug(slug); }

  @Get('public/officers/:slug')
  @ApiOperation({ summary: 'Public officer profile.' })
  publicOfficer(@Param('slug') slug: string) { return this.service.getPublicOfficerBySlug(slug); }

  @Get('public/office-locations')
  @ApiOperation({ summary: 'Public office locations.' })
  publicOffices() { return this.service.getPublicOfficeLocations(); }

  // === ADMIN ===
  @Get('contact-directory/summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  getSummary() { return this.service.getSummary(); }

  @Get('contact-directory/settings')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  getSettings() { return this.service.getSettings(); }

  @Put('contact-directory/settings')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateSettings(@Body() body: any) { return this.service.updateSettings(body); }

  // Departments
  @Get('contact-directory/departments')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listDepts(@Query('search') search?: string) { return this.service.listDepartments({ search }); }

  @Get('contact-directory/departments/tree')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  getDeptTree() { return this.service.getDepartmentTree(); }

  @Get('contact-directory/departments/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  getDept(@Param('id') id: string) { return this.service.getDepartmentById(id); }

  @Post('contact-directory/departments')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createDept(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createDepartment(body, user.id); }

  @Put('contact-directory/departments/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateDept(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.updateDepartment(id, body, user.id); }

  @Delete('contact-directory/departments/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteDept(@Param('id') id: string) { return this.service.deleteDepartment(id); }

  // Designations
  @Get('contact-directory/designations')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listDesig() { return this.service.listDesignations(); }

  @Post('contact-directory/designations')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createDesig(@Body() body: any) { return this.service.createDesignation(body); }

  @Put('contact-directory/designations/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateDesig(@Param('id') id: string, @Body() body: any) { return this.service.updateDesignation(id, body); }

  @Delete('contact-directory/designations/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteDesig(@Param('id') id: string) { return this.service.deleteDesignation(id); }

  // Officers
  @Get('contact-directory/officers')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listOfficers(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string, @Query('departmentId') deptId?: string, @Query('designationId') desigId?: string, @Query('status') status?: string) {
    return this.service.listOfficers({ page: page ? +page : undefined, limit: limit ? +limit : undefined, search, departmentId: deptId, designationId: desigId, status });
  }

  @Get('contact-directory/officers/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  getOfficer(@Param('id') id: string) { return this.service.getOfficerById(id); }

  @Post('contact-directory/officers')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createOfficer(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createOfficer(body, user.id); }

  @Put('contact-directory/officers/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateOfficer(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.updateOfficer(id, body, user.id); }

  @Delete('contact-directory/officers/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteOfficer(@Param('id') id: string) { return this.service.deleteOfficer(id); }

  // Office Locations
  @Get('contact-directory/office-locations')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listOffices() { return this.service.listOfficeLocations(); }

  @Post('contact-directory/office-locations')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createOffice(@Body() body: any) { return this.service.createOfficeLocation(body); }

  @Put('contact-directory/office-locations/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateOffice(@Param('id') id: string, @Body() body: any) { return this.service.updateOfficeLocation(id, body); }

  @Delete('contact-directory/office-locations/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteOffice(@Param('id') id: string) { return this.service.deleteOfficeLocation(id); }
}
