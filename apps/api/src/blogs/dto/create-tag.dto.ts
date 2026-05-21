import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateTagDto {
  @ApiProperty({ example: 'AI' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ai' })
  @IsString()
  @IsNotEmpty()
  @Matches(slugPattern, {
    message:
      'slug must contain lowercase letters, numbers, and hyphens only, without leading or trailing hyphens.',
  })
  slug!: string;
}
