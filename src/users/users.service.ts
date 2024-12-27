import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  
  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async createUser(createUserDTO): Promise<User> {
    return await this.userModel.create(createUserDTO);
  }
}
