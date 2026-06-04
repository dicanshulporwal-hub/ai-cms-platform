import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NewsroomService } from './newsroom.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('Newsroom')
@Controller()
export class NewsroomController {
  constructor(private readonly service: NewsroomService) {}

  // Public
  @Get('public/newsroom') @ApiOperation({ summary: 'Public newsroom listing.' })
  publicList(@Query('page') page?: string, @Query('limit') limit?: string, @Query('type') type?: string, @Query('category') cat?: string, @Query('search') search?: string, @Query('featured') featured?: string) {
    return this.service.getPublicList({ page: page ? +page : undefined, limit: limit ? +limit : undefined, itemType: type, categorySlug: cat, search, featured: featured === 'true' });
  }

  @Get('public/press-releases') @ApiOperation({ summary: 'Public press releases.' })
  publicPressReleases(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.service.getPublicList({ page: page ? +page : undefined, limit: limit ? +limit : undefined, itemType: 'PRESS_RELEASE', search });
  }

  @Get('public/newsroom/:slug') @ApiOperation({ summary: 'Public newsroom item by slug.' })
  publicBySlug(@Param('slug') slug: string) { return this.service.getPublicBySlug(slug); }

  @Get('public/press-releases/:slug') @ApiOperation({ summary: 'Public press release by slug.' })
  publicPrBySlug(@Param('slug') slug: string) { return this.service.getPublicBySlug(slug); }

  @Get('public/newsroom-categories') @ApiOperation({ summary: 'Public newsroom categories.' })
  publicCategories() { return this.service.getPublicCategories(); }

  // Admin
  @Get('newsroom/summary') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  getSummary() { return this.service.getSummary(); }

  @Get('newsroom') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  list(@Query('page') page?: string, @Query('limit') limit?: string, @Query('itemType') itemType?: string, @Query('status') status?: string, @Query('categoryId') catId?: string, @Query('priority') priority?: string, @Query('search') search?: string, @Query('sort') sort?: string) {
    return this.service.list({ page: page ? +page : undefined, limit: limit ? +limit : undefined, itemType, status, categoryId: catId, priority, search, sort });
  }

  @Get('newsroom/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  getById(@Param('id') id: string) { return this.service.getById(id); }

  @Post('newsroom') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  create(@Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.create(body, user.id); }

  @Put('newsroom/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, body, user.id); }

  @Delete('newsroom/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @Post('newsroom/:id/submit-review') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  submitReview(@Param('id') id: string) { return this.service.submitReview(id); }

  @Post('newsroom/:id/approve') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.approve(id, user.id); }

  @Post('newsroom/:id/publish') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Publisher')
  publish(@Param('id') id: string) { return this.service.publish(id); }

  @Post('newsroom/:id/archive') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  archive(@Param('id') id: string) { return this.service.archive(id); }

  // Categories
  @Get('newsroom-categories') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin', 'Editor')
  listCategories() { return this.service.listCategories(); }

  @Post('newsroom-categories') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  createCategory(@Body() body: any) { return this.service.createCategory(body); }

  @Put('newsroom-categories/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  updateCategory(@Param('id') id: string, @Body() body: any) { return this.service.updateCategory(id, body); }

  @Delete('newsroom-categories/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('Super Admin', 'Admin')
  deleteCategory(@Param('id') id: string) { return this.service.deleteCategory(id); }
}
