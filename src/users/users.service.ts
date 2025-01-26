import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterDTO } from 'src/auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async registerUser(registerDto: RegisterDTO): Promise<User> {
    // Check if a user with the given email already exists
    const existingUser = await this.userModel
      .findOne({ email: registerDto.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create a new user and save it to the database
    return await this.userModel.create(registerDto);
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    // Check if a user with the given email already exists
    const existingUser = await this.userModel
      .findOne({ email: user.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create a new user and save it to the database
    return await this.userModel.create(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findOne(query: any): Promise<UserDocument | null> {
    console.log(query);
    return await this.userModel.findOne(query).exec();
  }

  async updateUser(userId: string, updateData: Partial<UserDocument>) {
    if (updateData?.password) {
      updateData.password = await bcrypt.hash(updateData.password, 13);
    }
    return await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async deleteOne(id: string) {
    await this.userModel.findByIdAndDelete(id);
  }


}
