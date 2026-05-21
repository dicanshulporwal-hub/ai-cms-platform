import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';

class PageAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class PageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional()
  excerpt?: string | null;

  @ApiProperty()
  content!: string;

  @ApiPropertyOptional()
  featuredImage?: string | null;

  @ApiPropertyOptional()
  metaTitle?: string | null;

  @ApiPropertyOptional()
  metaDescription?: string | null;

  @ApiProperty({ enum: ContentStatus })
  status!: ContentStatus;

  @ApiPropertyOptional()
  authorId?: string | null;

  @ApiPropertyOptional({ type: PageAuthorDto })
  author?: PageAuthorDto | null;

  @ApiPropertyOptional()
  publishedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
