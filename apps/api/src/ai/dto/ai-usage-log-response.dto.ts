import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiUsageLogUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class AiUsageLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  provider!: string;

  @ApiPropertyOptional()
  model?: string | null;

  @ApiPropertyOptional()
  promptSummary?: string | null;

  @ApiProperty()
  tokenInput!: number;

  @ApiProperty()
  tokenOutput!: number;

  @ApiPropertyOptional({ type: AiUsageLogUserDto })
  user?: AiUsageLogUserDto | null;

  @ApiProperty()
  createdAt!: Date;
}
