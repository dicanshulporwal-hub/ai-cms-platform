import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { AIStatsDto } from './ai-stats.dto';
import { ChatbotStatsDto } from './chatbot-stats.dto';
import { ContentStatsDto } from './content-stats.dto';
import { RecentActivityDto } from './recent-activity.dto';

export class RecentContentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: ContentStatus })
  status!: ContentStatus;

  @ApiProperty()
  updatedAt!: Date;
}

export class RecentLeadDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string | null;

  @ApiProperty()
  email!: string | null;

  @ApiProperty()
  sourcePage!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class DashboardSummaryResponseDto extends ContentStatsDto {
  @ApiProperty()
  totalMedia!: number;

  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  totalAIRequests!: number;

  @ApiProperty()
  totalChatbotConversations!: number;

  @ApiProperty()
  totalLeads!: number;

  @ApiProperty({ type: RecentActivityDto, isArray: true })
  recentActivities!: RecentActivityDto[];

  @ApiProperty({ type: RecentContentDto, isArray: true })
  recentPages!: RecentContentDto[];

  @ApiProperty({ type: RecentContentDto, isArray: true })
  recentBlogs!: RecentContentDto[];

  @ApiProperty({ type: RecentLeadDto, isArray: true })
  recentLeads!: RecentLeadDto[];

  @ApiProperty()
  scope!: string;
}

export { AIStatsDto, ChatbotStatsDto, ContentStatsDto, RecentActivityDto };
