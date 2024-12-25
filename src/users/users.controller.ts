import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getHello(): string {
    return '';
  }
}
