import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { RedirectsService } from './redirects.service';

@ApiTags('Redirects')
@Controller()
export class RedirectsController {
  constructor(private readonly service: RedirectsService) {}

  // === PUBLIC (no auth) ===
  @Get('public/redirects/resolve')
  @ApiOperation({ summary: 'Resolve redirect for a path (public, no auth).' })
  resolve(@Query('path') path: string) { return this.service.resolve(path); }

  @Post('public/redirects/404-log')
  @ApiOperation({ summary: 'Log a 404 (public, no auth).' })
  log404(@Body() body: { path: string; referrer?: string }) { this.service.log404(body.path, body.referrer); return { logged: true }; }

  // === ADMIN ===
  @Get('redirects/summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get redirect summary.' })
  getSummary() { return this.service.getSummary(); }

  @Get('redirects')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List redirect rules.' })
  list() { return this.service.list(); }

  @Post('redirects')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create redirect rule.' })
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(body, user); }

  @Put('redirects/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update redirect rule.' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, body, user); }

  @Delete('redirects/:id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete redirect rule.' })
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.deleteRule(id, user); }

  @Get('redirects/404')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'List 404 logs.' })
  list404(@Query('status') status?: string) { return this.service.list404(status); }

  @Patch('redirects/404/:id/status')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update 404 log status.' })
  update404(@Param('id') id: string, @Body() body: { status: string }) { return this.service.update404Status(id, body.status); }

  @Post('redirects/404/:id/create-redirect')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create redirect from 404 log.' })
  createFrom404(@Param('id') id: string, @Body() body: { targetUrl: string }, @CurrentUser() user: AuthenticatedUser) { return this.service.createRedirectFrom404(id, body.targetUrl, user); }
}
