import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'user@example.com' },
      first_name: { type: 'string', example: 'John' },
      last_name: { type: 'string', example: 'Doe' },
    },
  })
  user: {
    id: number;
    email?: string;
    telegram_id?: string;
    first_name: string;
    last_name: string;
  };
}
