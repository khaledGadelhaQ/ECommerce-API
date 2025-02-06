import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from 'src/product/schemas/product.schema';
import { User } from 'src/users/schemas/user.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review {
  @Prop({
    type: String,
    required: [true, 'Review title should not be empty'],
    minlength: 3,
    maxlength: 50,
  })
  title: string;

  @Prop({
    type: String,
    minlength: 3,
    maxlength: 50000,
  })
  details: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  })
  user: string | User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product'],
  })
  product: string | Product;

  @Prop({
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not exceed 5'],
  })
  rating: number;
}

const ReviewSchema = SchemaFactory.createForClass(Review);

export { ReviewSchema };
