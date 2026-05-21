import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreatePageDto {
  @ApiProperty({ example: 'About Us' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'about-us' })
  @IsString()
  @IsNotEmpty()
  @Matches(slugPattern, {
    message:
      'slug must contain lowercase letters, numbers, and hyphens only, without leading or trailing hyphens.',
  })
  slug!: string;

  @ApiProperty({ example: '<p>Page content</p>' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  featuredImage?: string;

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  metaTitle?: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;
}
