import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecentActivityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty()
  entityId!: string;

  @ApiPropertyOptional()
  userName?: string | null;

  @ApiProperty()
  createdAt!: Date;
}
