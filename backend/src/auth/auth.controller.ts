import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '관리자 로그인',
    description:
      'JWT 토큰을 발급받습니다. 발급된 토큰은 Authorization: Bearer {token} 헤더로 사용합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공, JWT 토큰 발급',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: '유효하지 않은 입력 (username 또는 password 누락/형식 오류)',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (잘못된 사용자명 또는 비밀번호)',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}
