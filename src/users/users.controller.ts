import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Post()
  createUsers(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    console.log('User created:', createUserDto);
    return createUserDto;
  }
}
