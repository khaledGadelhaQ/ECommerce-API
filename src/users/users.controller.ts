import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Public()
  @Post()
  async createUser(@Body() createUserdto : CreateUserDTO){
    return await this.userService.createUser(createUserdto);
  }
 
  @Public()
  @Get()
  async getAll(): Promise<User[]> {
    return await this.userService.findAll();
  }
}
