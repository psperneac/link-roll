import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { UserDto } from '../models';

import moment from 'moment';
import { Model } from 'mongoose';
import { UserMapper } from './users.module';
import { User, UserDocument } from './user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(UserMapper) private readonly userMapper: UserMapper,
  ) {}

  async getAll(): Promise<UserDto[]> {
    const ret = await this.userModel.find().exec();

    if (ret && ret.length > 0) {
      console.log(ret);
      const retret = ret.map(user => this.userMapper.toDto(user as UserDocument));
      console.log(retret);
      return retret;
    }

    return [];
  }

  async getById(id: string): Promise<UserDto> {
    const user = await this.userModel.findById(id).exec();

    if(user) {
      return this.userMapper.toDto(user as UserDocument);
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async getByIdInternal(id: string): Promise<UserDocument> {
    return await this.userModel.findById(id).exec();
  }

  async getByEmail(email: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ email }).exec();

    if(user) {
      return this.userMapper.toDto(user as UserDocument);
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  /**
   * Returns user and hash of password of user for authentication.
   * Password is default not returned by the model.
   * @param email
   */
  async internalGetByEmail(email: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ email }).select('+password').exec();

    if(user) {
      return this.userMapper.toDto(user as UserDocument);
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async create(userDto: UserDto): Promise<UserDto> {
    const user = this.userMapper.toDomain(userDto);
    const now = moment().toISOString();

    const createdUser = new this.userModel({
      ...user,
      createdAt: now,
      modifiedAt: now,
    });
    return createdUser.save().then((doc) => this.userMapper.toDto(doc));
  }

  async update(id: string, user: UserDto): Promise<UserDto> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
  }

  async delete(id: string): Promise<UserDto> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
