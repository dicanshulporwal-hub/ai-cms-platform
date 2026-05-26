import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SummarizeContentDto {
  @ApiProperty({ example: '<p>Long content</p>' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  content!: string;

  @ApiPropertyOptional({ default: 120, maximum: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(40)
  @Max(500)
  maxLength = 120;
}
