import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'AI CMS Platform' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  siteName?: string;

  @ApiPropertyOptional({ example: 'An AI-first content management system' })
  @IsOptional()
  @IsString()
  siteDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  siteLogo?: string;

  @ApiPropertyOptional({ example: 'AI CMS - Empowering Content Teams', maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  defaultMetaTitle?: string;

  @ApiPropertyOptional({ example: 'Discover the power of AI-driven content management', maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  defaultMetaDescription?: string;

  @ApiPropertyOptional({ example: 'support@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(191)
  supportEmail?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  chatbotEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}
