import { ApiProperty } from '@nestjs/swagger';

export class AiResponseDataDto {
  @ApiProperty()
  result!: unknown;

  @ApiProperty()
  metadata!: Record<string, unknown>;
}

export class AiResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AiResponseDataDto })
  data!: AiResponseDataDto;
}
