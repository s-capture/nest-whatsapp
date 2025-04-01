import { ApiProperty } from '@nestjs/swagger';

export class sendMessageDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  content: string;
}
