import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User> & {
  createResetPasswordToken: () => string;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: Role, default: Role.Customer })
  role: Role;

  @Prop({ type: Boolean, default: true })
  active: Boolean;

  @Prop({ type: Boolean, default: false })
  isVerified: Boolean;

  @Prop({ type: String, default: undefined })
  passwordResetToken?: string;

  @Prop({ type: Date, default: undefined })
  passwordResetExpires?: Date;

  @Prop({ type: String })
  id?: string;
}

const UserSchema = SchemaFactory.createForClass(User);

// Create a virtual 'id' field that maps to '_id'
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure the virtual field is included in JSON responses
UserSchema.set('toJSON', {
  virtuals: true,
});

UserSchema.methods.createResetPasswordToken =
  async function (): Promise<string> {
    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    // Set the token expiration time ( 10 minutes from now)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await this.save();
    return resetToken;
  };

UserSchema.pre<UserDocument>('save', async function (next) {
  try {
    const user = this as UserDocument;
    if (!user.isModified('password')) return next();

    const SALT_ROUNDS = 13;
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);

    next();
  } catch (error) {
    throw new Error(error.message);
  }
});

export { UserSchema };
