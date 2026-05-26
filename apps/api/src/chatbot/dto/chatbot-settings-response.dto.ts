import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatbotSettingsResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  isEnabled!: boolean;

  @ApiProperty()
  greetingMessage!: string;

  @ApiProperty()
  fallbackMessage!: string;

  @ApiProperty()
  leadCaptureEnabled!: boolean;

  @ApiPropertyOptional()
  supportEmail?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
