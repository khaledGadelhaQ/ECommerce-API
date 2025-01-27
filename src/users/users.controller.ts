import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Roles(Role.Admin)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query : any) {
    const documents = await this.userService.findAll(query);
    return {
      status: 'success',
      message: `${documents.results} user(s) found`,
      data: documents.data ,
    };
  }

  @Roles(Role.Admin)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ValidateObjectIdPipe) id: string) {
    const user = await this.userService.findOne({ _id: id });
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
    await this.userService.delete(id);
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
