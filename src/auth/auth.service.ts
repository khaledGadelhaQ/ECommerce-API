import {
  HttpException,
  HttpStatus,
  Injectable,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from './dto/register.dto';
import { EmailService } from '../common/email';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(user) {
    const payload = { sub: user.id, email: user.email };
    return await this.jwtService.sign(payload);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const accessToken = await this.generateToken(user);
    return {
      access_token: accessToken,
    };
  }

  async register(registerDto: RegisterDTO) {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Replace the plain password with the hashed password
    registerDto.password = hashedPassword;

    // Use the UsersService to create the user
    const newUser = await this.usersService.createUser(registerDto);

    return {
      message: 'User registered successfully',
    };
  }

  async sendVerificationEmail(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    if (user.isVerified) {
      throw new HttpException(
        'Email is already verified.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_EMAIL_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EMAIL_EXPIRES_IN'),
    });

    const baseURL = this.configService.get<string>('APP_URL');
    const verificationEmailURL = `${baseURL}auth/verify-email/${token}`;

    await this.emailService.sendVerificationEmail(user, verificationEmailURL);

    return { message: 'Verification email sent successfully.' };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_EMAIL_SECRET'),
      });
      const user = await this.usersService.findOne(decoded.email);
      if (!user || user.isVerified) {
        return false;
      }
      await this.usersService.updateUser(user.id, { isVerified: true });
    } catch (error) {
      return false;
    }
    return true;
  }
}
