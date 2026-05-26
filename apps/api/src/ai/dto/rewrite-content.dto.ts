import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RewriteContentDto {
  @ApiProperty({ example: '<p>Existing content</p>' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  content!: string;

  @ApiProperty({ example: 'professional and concise' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  tone!: string;

  @ApiPropertyOptional({ example: 'Make this more persuasive.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instruction?: string;
}
