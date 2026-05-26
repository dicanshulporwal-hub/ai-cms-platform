import { ApiProperty } from '@nestjs/swagger';

export class ChatbotSourceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['PAGE', 'BLOG'] })
  type!: 'PAGE' | 'BLOG';

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;
}

export class ChatbotResponseDto {
  @ApiProperty()
  conversationId!: string;

  @ApiProperty()
  answer!: string;

  @ApiProperty({ type: ChatbotSourceDto, isArray: true })
  sources!: ChatbotSourceDto[];

  @ApiProperty()
  leadCaptureSuggested!: boolean;
}
