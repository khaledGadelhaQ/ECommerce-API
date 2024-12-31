import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

    // Return a success response
    const accessToken = await this.generateToken(newUser);
    return {
      message: 'User registered successfully',
      access_token: accessToken,
      user: {
        email: newUser.email,
        role: newUser.role,
      },
    };
  }
}
