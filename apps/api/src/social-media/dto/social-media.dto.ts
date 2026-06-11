import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const platformPattern = /^[a-z0-9_-]+$/;

export const SOCIAL_ACCOUNT_STATUSES = [
  'SOCIAL_CONNECTED',
  'SOCIAL_DISCONNECTED',
  'SOCIAL_TOKEN_EXPIRED',
  'SOCIAL_ERROR',
  'SOCIAL_DISABLED',
] as const;

export const SOCIAL_POST_STATUSES = [
  'SOCIAL_POST_DRAFT',
  'SOCIAL_POST_PENDING_APPROVAL',
  'SOCIAL_POST_APPROVED',
  'SOCIAL_POST_QUEUED',
  'SOCIAL_POST_PUBLISHING',
  'SOCIAL_POST_PUBLISHED',
  'SOCIAL_POST_PARTIALLY_PUBLISHED',
  'SOCIAL_POST_FAILED',
  'SOCIAL_POST_CANCELLED',
] as const;

export class SocialListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class SocialAccountQueryDto extends SocialListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(platformPattern)
  platformKey?: string;

  @ApiPropertyOptional({ enum: SOCIAL_ACCOUNT_STATUSES })
  @IsOptional()
  @IsIn(SOCIAL_ACCOUNT_STATUSES)
  status?: string;
}

export class SocialPostQueryDto extends SocialListQueryDto {
  @ApiPropertyOptional({ enum: SOCIAL_POST_STATUSES })
  @IsOptional()
  @IsIn(SOCIAL_POST_STATUSES)
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(platformPattern)
  platformKey?: string;
}

export class CreateSocialAccountDto {
  @ApiProperty({ example: 'linkedin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(platformPattern)
  platformKey!: string;

  @ApiProperty({ example: 'Official CMS LinkedIn' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  accountName!: string;

  @ApiPropertyOptional({ example: '@ai-cms' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  accountHandle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  accountIdExternal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  profileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  profileImageUrl?: string;

  @ApiPropertyOptional({ enum: SOCIAL_ACCOUNT_STATUSES })
  @IsOptional()
  @IsIn(SOCIAL_ACCOUNT_STATUSES)
  status?: string;
}

export class UpdateSocialAccountDto extends PartialType(CreateSocialAccountDto) {}

export class CreateSocialPostDto {
  @ApiProperty({ example: 'Launch post' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @ApiProperty({ example: 'We published a new update on the website.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  sourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  sourceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  linkUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(191, { each: true })
  mediaIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  accountIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;
}

export class UpdateSocialPostDto extends PartialType(CreateSocialPostDto) {}

export class UpdateSocialSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoPostBlogsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoPostNewsroomEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoPostAnnouncementsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireApprovalBeforeSocialPost?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  defaultHashtags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  maxRetries?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(3600)
  retryBackoffSeconds?: number;
}
