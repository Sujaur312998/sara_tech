import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../entity/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  createUsers(@Body() createUserDto: CreateUserDto) {
    //save user to pg user table
    // instead of saveing i have seeded users
    return createUserDto;
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
