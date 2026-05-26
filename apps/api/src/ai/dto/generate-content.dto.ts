import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GenerateContentDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType!: ContentType;

  @ApiProperty({ example: 'How AI improves editorial workflows' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  topic!: string;

  @ApiProperty({ example: 'Marketing managers at B2B SaaS companies' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  targetAudience!: string;

  @ApiProperty({ example: 'clear, practical, confident' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  tone!: string;

  @ApiPropertyOptional({ example: 'AI CMS, content workflow' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  keywords?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  language?: string;
}
