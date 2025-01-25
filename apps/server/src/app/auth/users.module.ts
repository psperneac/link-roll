import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UserDto } from '../models';

import { omit } from 'lodash';
import { Model } from 'mongoose';
import { User, UserDocument } from './user';

@Injectable()
export class UserMapper {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  toDto(userDoc: UserDocument): UserDto {
    return omit(userDoc.toObject({ getters: true }), ['_id', '__v']);
  }

  toDomain(userDto: UserDto): Partial<UserDocument> {
    return {
      username: userDto.username,
      email: userDto.email,
      password: userDto.password,
      scope: userDto.scope,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
    };
  }
}
