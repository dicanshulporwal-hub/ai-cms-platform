import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus, ContentType } from '@prisma/client';

class WorkflowUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class WorkflowHistoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ContentType })
  contentType!: ContentType;

  @ApiProperty()
  contentId!: string;

  @ApiPropertyOptional({ enum: ContentStatus })
  fromStatus?: ContentStatus | null;

  @ApiProperty({ enum: ContentStatus })
  toStatus!: ContentStatus;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional()
  comment?: string | null;

  @ApiPropertyOptional()
  performedById?: string | null;

  @ApiPropertyOptional({ type: WorkflowUserDto })
  performedBy?: WorkflowUserDto | null;

  @ApiProperty()
  createdAt!: Date;
}
