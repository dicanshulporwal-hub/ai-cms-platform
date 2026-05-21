import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';

class BlogAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

class BlogCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

class BlogTagDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class BlogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  content!: string;

  @ApiPropertyOptional()
  excerpt?: string | null;

  @ApiPropertyOptional()
  featuredImage?: string | null;

  @ApiPropertyOptional()
  categoryId?: string | null;

  @ApiPropertyOptional({ type: BlogCategoryDto })
  category?: BlogCategoryDto | null;

  @ApiProperty({ type: [BlogTagDto] })
  tags!: BlogTagDto[];

  @ApiPropertyOptional()
  metaTitle?: string | null;

  @ApiPropertyOptional()
  metaDescription?: string | null;

  @ApiProperty({ enum: ContentStatus })
  status!: ContentStatus;

  @ApiPropertyOptional()
  authorId?: string | null;

  @ApiPropertyOptional({ type: BlogAuthorDto })
  author?: BlogAuthorDto | null;

  @ApiPropertyOptional()
  publishedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
