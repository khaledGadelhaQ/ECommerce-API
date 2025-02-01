import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

class CartItem {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Cart {
  @Prop({ type: [CartItem], default: [] })
  cartItems: CartItem[];

  @Prop({ type: Number, default: 0 })
  totalCartPrice: number;

  @Prop({ type: Number, default: 0 })
  totalCartPriceAfterDiscount: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'This cart must belong to a user'],
    index: true,
  })
  user: string;
}

const CartSchema = SchemaFactory.createForClass(Cart);

export { CartSchema };
