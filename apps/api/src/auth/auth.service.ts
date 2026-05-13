import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './types/authenticated-user.type';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithRole(loginDto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User account is inactive.');
    }

    return this.createAuthResponse(this.usersService.toAuthenticatedUser(user));
  }

  async createAuthResponse(
    user: AuthenticatedUser,
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      email: user.email,
      role: user.role,
      sub: user.id,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
