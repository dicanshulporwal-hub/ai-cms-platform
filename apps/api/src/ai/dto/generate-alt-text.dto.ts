import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class GenerateAltTextDto {
  @ApiProperty({ example: 'http://localhost:3001/uploads/media/example.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  imageUrl!: string;

  @ApiPropertyOptional({ example: 'Hero image for an AI CMS landing page' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;
}
