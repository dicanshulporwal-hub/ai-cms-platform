import { ApiProperty } from '@nestjs/swagger';

export class ChatbotStatsDto {
  @ApiProperty()
  totalChatbotConversations!: number;

  @ApiProperty()
  totalLeads!: number;
}
