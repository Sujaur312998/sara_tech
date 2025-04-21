import {
  Body,
  Controller,
  Get,
  HttpCode,
  Options,
  Post,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../entity/user.entity';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Options()
  @HttpCode(204)
  handleOptions(@Res() res: Response) {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.send();
  }
}
