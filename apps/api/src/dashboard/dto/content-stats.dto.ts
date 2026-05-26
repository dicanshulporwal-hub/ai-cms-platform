import { ApiProperty } from '@nestjs/swagger';

export class ContentStatsDto {
  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  publishedPages!: number;

  @ApiProperty()
  draftPages!: number;

  @ApiProperty()
  submittedPages!: number;

  @ApiProperty()
  totalBlogs!: number;

  @ApiProperty()
  publishedBlogs!: number;

  @ApiProperty()
  draftBlogs!: number;

  @ApiProperty()
  submittedBlogs!: number;

  @ApiProperty()
  pendingWorkflowItems!: number;
}
