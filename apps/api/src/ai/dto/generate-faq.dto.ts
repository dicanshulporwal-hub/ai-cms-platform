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

export class GenerateFaqDto {
  @ApiProperty({ example: '<p>Content to turn into FAQs</p>' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  content!: string;

  @ApiPropertyOptional({ default: 5, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(10)
  numberOfQuestions = 5;
}
