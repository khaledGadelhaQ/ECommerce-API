import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/auth/roles.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: Role, default: Role.Customer })
  role: Role;

  @Prop({ type: Boolean, default: true})
  active: Boolean;

  @Prop({ type: Boolean, default: false})
  isVerified: Boolean;
  
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

export { UserSchema };
