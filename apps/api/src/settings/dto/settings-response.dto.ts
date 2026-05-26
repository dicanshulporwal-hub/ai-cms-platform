import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  siteName!: string;

  @ApiPropertyOptional()
  siteDescription?: string | null;

  @ApiPropertyOptional()
  siteLogo?: string | null;

  @ApiPropertyOptional({ maxLength: 60 })
  defaultMetaTitle?: string | null;

  @ApiPropertyOptional({ maxLength: 160 })
  defaultMetaDescription?: string | null;

  @ApiPropertyOptional()
  supportEmail?: string | null;

  @ApiProperty()
  chatbotEnabled!: boolean;

  @ApiProperty()
  aiEnabled!: boolean;

  @ApiProperty()
  maintenanceMode!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
