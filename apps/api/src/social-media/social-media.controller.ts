import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import {
  CreateSocialAccountDto,
  CreateSocialPostDto,
  SocialAccountQueryDto,
  SocialPostQueryDto,
  UpdateSocialAccountDto,
  UpdateSocialPostDto,
  UpdateSocialSettingsDto,
} from './dto/social-media.dto';
import { SocialMediaService } from './social-media.service';

@ApiTags('Social Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('social-media')
export class SocialMediaController {
  constructor(private readonly service: SocialMediaService) {}

  @Get('summary')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Social media dashboard summary.' })
  getSummary() {
    return this.service.getSummary();
  }

  @Get('accounts')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'List social accounts.' })
  listAccounts(@Query() query: SocialAccountQueryDto) {
    return this.service.listAccounts(query);
  }

  @Get('accounts/:id')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Get social account detail.' })
  getAccount(@Param('id') id: string) {
    return this.service.getAccount(id);
  }

  @Post('accounts')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create social account.' })
  createAccount(@Body() body: CreateSocialAccountDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createAccount(body, user.id);
  }

  @Put('accounts/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update social account.' })
  updateAccount(
    @Param('id') id: string,
    @Body() body: UpdateSocialAccountDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateAccount(id, body, user.id);
  }

  @Delete('accounts/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete social account.' })
  deleteAccount(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.deleteAccount(id, user.id);
  }

  @Get('posts')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'List social posts.' })
  listPosts(@Query() query: SocialPostQueryDto) {
    return this.service.listPosts(query);
  }

  @Get('posts/:id')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Get social post detail.' })
  getPost(@Param('id') id: string) {
    return this.service.getPost(id);
  }

  @Post('posts')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Create social post.' })
  createPost(@Body() body: CreateSocialPostDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createPost(body, user.id);
  }

  @Put('posts/:id')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Update social post.' })
  updatePost(
    @Param('id') id: string,
    @Body() body: UpdateSocialPostDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updatePost(id, body, user.id);
  }

  @Delete('posts/:id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Soft delete social post.' })
  deletePost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.deletePost(id, user.id);
  }

  @Post('posts/:id/submit')
  @Roles('Super Admin', 'Admin', 'Editor', 'Publisher')
  @ApiOperation({ summary: 'Submit social post for approval.' })
  submitPost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.submitPost(id, user.id);
  }

  @Post('posts/:id/approve')
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Approve social post.' })
  approvePost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.approvePost(id, user.id);
  }

  @Post('posts/:id/queue')
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Queue social post.' })
  queuePost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.queuePost(id, user.id);
  }

  @Post('posts/:id/publish')
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Publish social post using MVP simulated provider.' })
  publishPost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.publishPost(id, user.id);
  }

  @Post('posts/:id/cancel')
  @Roles('Super Admin', 'Admin', 'Publisher')
  @ApiOperation({ summary: 'Cancel social post.' })
  cancelPost(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.cancelPost(id, user.id);
  }

  @Get('settings')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get social media settings.' })
  getSettings() {
    return this.service.getSettings();
  }

  @Put('settings')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update social media settings.' })
  updateSettings(@Body() body: UpdateSocialSettingsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.updateSettings(body, user.id);
  }
}
