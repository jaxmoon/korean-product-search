import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '관리자 사용자명',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: '관리자 비밀번호',
    example: 'your-strong-password',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAzNjAwMH0.abc123',
  })
  accessToken!: string;

  @ApiProperty({
    description: '토큰 타입',
    example: 'Bearer',
  })
  tokenType!: string;

  @ApiProperty({
    description: '토큰 만료 시간 (초)',
    example: 3600,
  })
  expiresIn!: number;
}
