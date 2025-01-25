import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SerializeOptions,
  UseFilters,
  UseGuards
} from '@nestjs/common';

import { UserDto } from '../models';

import { AllExceptionsFilter } from '../utils/all-exceptions.filter';
import { Admin, LoggedIn } from './authentication.guards';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(LoggedIn, Admin)
@SerializeOptions({
  strategy: 'excludeAll',
})
@UseFilters(AllExceptionsFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Get()
  getAllUsers() {
    return this.usersService.getAll();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Get('/by-email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.getByEmail(email);
  }

  @Post()
  async createUser(@Body() user: UserDto) {
    return this.usersService.create(user);
  }

  @Put(':id')
  async replaceUser(@Param('id') id: string, @Body() user: UserDto) {
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
