import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

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
