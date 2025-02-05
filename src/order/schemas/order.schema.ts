import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, Query, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Product } from 'src/product/schemas/product.schema';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: string | User;

  @Prop([
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ])
  items: {
    product: string | Product;
    quantity: number;
    price: number;
  }[];

  @Prop({ type: String, enum: Object.values(PaymentMethod), required: true })
  paymentMethod: PaymentMethod;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    required: true,
  })
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };

  @Prop({ type: Date, default: null })
  deliveredAt?: Date;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: Number, required: true })
  totalOrderPrice: number;

  @Prop({ type: String, default: null }) // For storing Stripe payment intent ID
  paymentIntentId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
