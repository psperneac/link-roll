import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserDto } from '../models';

import { RegisterDto, SCOPE_USER, TokenPayload } from './authentication.module';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { ApiKey, ApiKeyService } from './api-key.module';

export interface ValidationResponse {
  validated: boolean;
  user: UserDto;
  error: string;
}

@Injectable()
export class AuthenticationService {
  logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly apiKeyService: ApiKeyService,
    private readonly jwtService: JwtService) {}

  public async register(registrationData: RegisterDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    const createdUser = await this.usersService.create({
      ...registrationData,
      password: hashedPassword,
      scope: SCOPE_USER
    });

    createdUser.password = undefined;
    return createdUser;
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.internalGetByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      // remove password hash from user object because user is returned by login
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public async getApiKeyByApiKeyInternal(apikey: string): Promise<ApiKey> {
    return this.apiKeyService.getApiKeyByApiKeyInternal(apikey);
  }

  async validateApiKey(key: ApiKey): Promise<ValidationResponse> {
    if (!!key.expiresAt && key.expiresAt.getTime() < new Date().getTime()) {
      return { validated: false, user: null, error: 'API Key expired' };
    }

    return { validated: true, error: null, user: await this.getAuthenticatedUserForApiKey(key) };
  }

  async getAuthenticatedUserForApiKey(key: ApiKey) {
    console.log('getAuthenticatedUserForApiKey', key, key.userId.toString());  
    return this.usersService.getById(key.userId.toString());
  }

  public getAuthorizationBearer(userId: string) {
    // TODO: add expiry of max-session 15-30min
    // TODO: figure out how to refresh token when expired
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME')
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')
    });
    return {
      authorization: `Bearer ${token}`,
      accessToken: token,
      refreshToken: refreshToken
    };
  }
}
