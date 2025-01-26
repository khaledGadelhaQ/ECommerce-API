import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/roles.enum';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Roles(Role.Admin)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll() {
    const users = await this.userService.findAll();
    return {
      status: 'success',
      message: `${users.length} user(s) found`,
      data: { users },
    };
  }

  @Roles(Role.Admin)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id', ValidateObjectIdPipe) id: string) {
    const user = await this.userService.findOne({ _id: id });
    if (!user) {
      throw new HttpException('User was not found!', HttpStatus.NOT_FOUND);
    }
    return {
      status: 'success',
      data: { user },
    };
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() updateUser: UpdateUserDTO,
  ) {
    const user = await this.userService.updateUser(id, updateUser);
    if (!user) {
      throw new HttpException('User was not found!', HttpStatus.NOT_FOUND);
    }
    return {
      status: 'success',
      message: 'User updated successfully!',
      data: { user },
    };
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  async deleteOne(@Param('id', ValidateObjectIdPipe) id: string) {
    await this.userService.deleteOne(id);
    return;
  }

  @Roles(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async createUser(@Body() userDTO: CreateUserDTO) {
    const user = await this.userService.createUser(userDTO);
    return {
      status: 'success',
      message: 'New user created successfully!',
      data: { user },
    };
  }
}
