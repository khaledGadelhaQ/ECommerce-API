import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async createUser(@Body() createUserdto : CreateUserDTO){
    return await this.userService.createUser(createUserdto);
  }

  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.findAll();
  }
}
