import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateSeoDto {
  @ApiProperty({ example: 'AI CMS for Marketing Teams' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: '<p>Content body</p>' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  content!: string;

  @ApiPropertyOptional({ example: 'AI CMS, content operations' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  keywords?: string;
}
