import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      this.logError('Failed to create user', error);
      throw new InternalServerErrorException('Unable to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        select: ['id', 'name', 'deviceToken'],
        order: { id: 'ASC' },
        // take: 10,
      });
    } catch (error) {
      this.logError('Failed to fetch users', error);
      throw new InternalServerErrorException('Unable to fetch users');
    }
  }

  private logError(message: string, error: unknown) {
    if (error instanceof Error) {
      this.logger.error(message, error.stack);
    } else {
      this.logger.error(message, JSON.stringify(error));
    }
  }
}
