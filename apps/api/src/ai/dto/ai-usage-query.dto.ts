import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AiUsageQueryDto {
  @ApiPropertyOptional({ example: 'generate-content' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string;
}
