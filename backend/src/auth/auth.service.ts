import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly adminUsername: string;
  private readonly adminPasswordHash: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.adminUsername = this.configService.get<string>('ADMIN_USERNAME', 'admin');
    this.adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH', '');

    if (!this.adminPasswordHash) {
      console.warn(
        '⚠️  ADMIN_PASSWORD_HASH is not set. Admin login will not work. ' +
          "Generate a hash: node -e \"require('bcrypt').hash('your-password', 10, (e,h) => console.log(h))\"",
      );
    }
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    if (username !== this.adminUsername) {
      return false;
    }

    if (!this.adminPasswordHash) {
      return false;
    }

    return await bcrypt.compare(password, this.adminPasswordHash);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const isValid = await this.validateUser(loginDto.username, loginDto.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      username: loginDto.username,
      sub: loginDto.username,
    };

    const expiresIn = 3600; // 1 hour

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  async verifyToken(token: string): Promise<{ username: string; sub: string }> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
