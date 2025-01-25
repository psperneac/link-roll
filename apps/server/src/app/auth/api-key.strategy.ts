import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthenticationService } from './authentication.service';
import { UserDto } from '../models';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthenticationService) {
    // false to pass request otherwise it can't figure out which one is the done() function
    super({ header: 'apiKey', prefix: '' }, false);
  }

  async validate(apiKey: string): Promise<UserDto> {
    const key = await this.authService.getApiKeyByApiKeyInternal(apiKey);
    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    const userValidationResponse = await this.authService.validateApiKey(key);
    if (userValidationResponse.validated && userValidationResponse.user) {
      return userValidationResponse.user;
    }

    throw new NotFoundException(userValidationResponse.error ?? 'User for API Key not found');
  }
}
