import { Body, Controller, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';
import { AnalyticsTrackingService } from './analytics-tracking.service';

@ApiTags('Analytics')
@Controller()
export class AnalyticsController {
  constructor(
    private readonly service: AnalyticsService,
    private readonly tracking: AnalyticsTrackingService,
    private readonly prisma: PrismaService,
  ) {}

  // === PUBLIC TRACKING ENDPOINT (no auth) ===

  @Post('public/analytics/event')
  @ApiOperation({ summary: 'Track a public analytics event (no auth required).' })
  async trackEvent(@Body() body: any, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
    const userAgent = req.headers['user-agent'] as string;
    const success = await this.tracking.trackEvent(body, ip, userAgent);
    return { tracked: success };
  }

  // === ADMIN ENDPOINTS ===

  @Get('analytics/overview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get analytics overview.' })
  getOverview(@Query('days') days?: string) {
    return this.service.getOverview(days ? parseInt(days) : 30);
  }

  @Get('analytics/content')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get top content analytics.' })
  getTopContent(@Query('days') days?: string) {
    return this.service.getTopContent(days ? parseInt(days) : 30);
  }

  @Get('analytics/search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get search analytics.' })
  getSearchAnalytics(@Query('days') days?: string) {
    return this.service.getSearchAnalytics(days ? parseInt(days) : 30);
  }

  @Get('analytics/devices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get device breakdown.' })
  getDevices(@Query('days') days?: string) {
    return this.service.getDeviceBreakdown(days ? parseInt(days) : 30);
  }

  @Get('analytics/recent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get recent events.' })
  getRecent() {
    return this.service.getRecentEvents();
  }

  @Get('analytics/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Get analytics settings.' })
  getSettings() {
    return this.service.getSettings();
  }

  @Put('analytics/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update analytics settings.' })
  async updateSettings(@Body() body: any, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.service.updateSettings(body);
    await this.prisma.auditLog.create({ data: { action: 'analytics.settings_updated', entityId: result.id, entityType: 'AnalyticsSettings', userId: user.id, metadata: {} as unknown as Prisma.InputJsonValue } });
    return result;
  }
}
