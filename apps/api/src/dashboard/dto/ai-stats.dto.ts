import { ApiProperty } from '@nestjs/swagger';

export class AIStatsDto {
  @ApiProperty()
  totalAIRequests!: number;
}
