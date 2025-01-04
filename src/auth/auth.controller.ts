import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDTO) {
    return this.authService.register(registerDto);
  }

  @Post('send-verification-email')
  async sendVerificationEmail(@Body('email') email: string) {
    return await this.authService.sendVerificationEmail(email);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    const isVerified = await this.authService.verifyEmail(token);
    if (!isVerified) {
      throw new HttpException(
        'Invalid or expired token.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: 'Email verified successfully.',
    };
  }
}
