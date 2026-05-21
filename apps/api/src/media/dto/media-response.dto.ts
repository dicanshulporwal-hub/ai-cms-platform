import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MediaUploaderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class MediaResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  originalName!: string;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  fileUrl!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  fileSize!: number;

  @ApiPropertyOptional()
  altText?: string | null;

  @ApiPropertyOptional()
  caption?: string | null;

  @ApiPropertyOptional()
  folder?: string | null;

  @ApiPropertyOptional()
  uploadedById?: string | null;

  @ApiPropertyOptional({ type: MediaUploaderDto })
  uploadedBy?: MediaUploaderDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
