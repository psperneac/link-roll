import {
  Module
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';
import { UsersController } from './users.controller';
import { UserMapper } from './users.module';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, LoggedIn } from './authentication.guards';
import { AuthenticationService } from './authentication.service';
import { UsersService } from './users.service';
import { User, UserDocument, UserSchema } from './user';
import { ApiKeyStrategy } from './api-key.strategy';
import { ApiKeyModule } from './api-key.module';

export const SCOPE_USER = 'USER';
export const SCOPE_ADMIN = 'ADMIN';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}

export interface RequestWithUser extends Request {
  user: UserDocument;
}

export interface TokenPayload {
  userId: string;
}

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    User,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ApiKeyModule,
  ],
  controllers: [AuthenticationController, UsersController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    ApiKeyStrategy,
    JwtStrategy,
    UsersService,
    UserMapper,
    LoggedIn,
    Admin
  ],
  exports: [User, AuthenticationService, UsersService, LoggedIn, Admin],
})
export class AuthenticationModule {}
