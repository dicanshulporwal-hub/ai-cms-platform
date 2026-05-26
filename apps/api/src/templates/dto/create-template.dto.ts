import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Government Portal' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'A GIGW-ready government website template.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['GOVERNMENT', 'CORPORATE', 'BLOG', 'LANDING_PAGE', 'CUSTOM'] })
  @IsOptional()
  @IsString()
  templateType?: string;
}

export class AIGenerateTemplateDto {
  @ApiPropertyOptional({ example: 'Generate a GIGW-ready government department homepage with hero section and announcements.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  prompt?: string;

  @ApiPropertyOptional({ enum: ['GOVERNMENT', 'CORPORATE', 'BLOG', 'LANDING_PAGE', 'CUSTOM'] })
  @IsOptional()
  @IsString()
  templateType?: string;
}
