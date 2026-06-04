import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RtiService } from './rti.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('RTI')
@Controller()
export class RtiController {
  constructor(private readonly service: RtiService) {}

  // === PUBLIC (no auth) ===

  @Get('public/rti/officers')
  @ApiOperation({ summary: 'List RTI officers (public).' })
  publicOfficers() { return this.service.getPublicOfficers(); }

  @Get('public/rti/disclosures')
  @ApiOperation({ summary: 'List public RTI disclosures.' })
  publicDisclosures(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.getPublicDisclosures({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('public/rti/submit')
  @ApiOperation({ summary: 'Submit an RTI request (public, no auth).' })
  publicSubmit(@Body() body: any) { return this.service.submitPublicRequest(body); }

  // === ADMIN ===

  @Get('rti/summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'RTI summary stats.' })
  getSummary() { return this.service.getSummary(); }

  @Get('rti/requests')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List RTI requests.' })
  listRequests(@Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string, @Query('search') search?: string) {
    return this.service.listRequests({ page: page ? parseInt(page, 10) : undefined, limit: limit ? parseInt(limit, 10) : undefined, status, search });
  }

  @Get('rti/requests/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get RTI request by ID.' })
  getRequest(@Param('id') id: string) { return this.service.getRequestById(id); }

  @Post('rti/requests')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create RTI request (admin).' })
  createRequest(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.createRequest(body, user.id); }

  @Put('rti/requests/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update RTI request.' })
  updateRequest(@Param('id') id: string, @Body() body: any) { return this.service.updateRequest(id, body); }

  @Post('rti/requests/:id/status')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update RTI request status.' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string; remarks?: string }) { return this.service.updateStatus(id, body.status, body.remarks); }

  @Delete('rti/requests/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete RTI request.' })
  deleteRequest(@Param('id') id: string) { return this.service.deleteRequest(id); }

  // === OFFICERS ===

  @Get('rti/officers')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List RTI officers.' })
  listOfficers() { return this.service.listOfficers(); }

  @Post('rti/officers')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create RTI officer.' })
  createOfficer(@Body() body: any) { return this.service.createOfficer(body); }

  @Put('rti/officers/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update RTI officer.' })
  updateOfficer(@Param('id') id: string, @Body() body: any) { return this.service.updateOfficer(id, body); }

  @Delete('rti/officers/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Deactivate RTI officer.' })
  deleteOfficer(@Param('id') id: string) { return this.service.deleteOfficer(id); }
}
