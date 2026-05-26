import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import {
  AIStatsDto,
  ChatbotStatsDto,
  ContentStatsDto,
  DashboardSummaryResponseDto,
  RecentActivityDto,
} from './dto/dashboard-summary-response.dto';
import { DashboardService } from './dashboard.service';

const DASHBOARD_ROLES = [
  'Super Admin',
  'Admin',
  'Editor',
  'Reviewer',
  'Publisher',
  'Viewer',
];

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...DASHBOARD_ROLES)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOkResponse({ type: DashboardSummaryResponseDto })
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getSummary(user);
  }

  @Get('content-stats')
  @ApiOkResponse({ type: ContentStatsDto })
  contentStats(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getContentStats(user);
  }

  @Get('ai-stats')
  @ApiOkResponse({ type: AIStatsDto })
  aiStats(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getAiStats(user);
  }

  @Get('chatbot-stats')
  @ApiOkResponse({ type: ChatbotStatsDto })
  chatbotStats(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getChatbotStats(user);
  }

  @Get('recent-activity')
  @ApiOkResponse({ type: RecentActivityDto, isArray: true })
  recentActivity(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getRecentActivity(user);
  }
}
