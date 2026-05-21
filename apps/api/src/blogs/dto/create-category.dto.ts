import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateCategoryDto {
  @ApiProperty({ example: 'Announcements' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'announcements' })
  @IsString()
  @IsNotEmpty()
  @Matches(slugPattern, {
    message:
      'slug must contain lowercase letters, numbers, and hyphens only, without leading or trailing hyphens.',
  })
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
