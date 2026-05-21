import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateBlogDto {
  @ApiProperty({ example: 'How AI Changes CMS Workflows' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'how-ai-changes-cms-workflows' })
  @IsString()
  @IsNotEmpty()
  @Matches(slugPattern, {
    message:
      'slug must contain lowercase letters, numbers, and hyphens only, without leading or trailing hyphens.',
  })
  slug!: string;

  @ApiProperty({ example: '<p>Blog content</p>' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'https://example.com/blog-image.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  featuredImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tagIds?: string[];

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
