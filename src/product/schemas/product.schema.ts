import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Query } from 'mongoose';
import slugify from 'slugify';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, lowercase: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: Number,
    required: true,
    min: [0, 'Quantity must not be negative'],
  })
  quantity: number;

  @Prop({ type: Number, default: 0 })
  sold: number;

  @Prop({
    type: Number,
    required: true,
    min: [0, 'Price must be positive'],
    validate: {
      validator: function (value: number) {
        return (
          value >= (this as any).priceAfterDiscount || !this.priceAfterDiscount
        );
      },
      message: 'Price must be greater than or equal to the discounted price.',
    },
  })
  price: number;

  @Prop({
    type: Number,
    default: 0,
    min: [0, 'Discount must be positive'],
    max: [100, 'Discount cannot exceed 100%'],
  })
  discountPercentage: number;

  @Prop({
    type: [String],
    validate: {
      validator: (value: string[]) =>
        value.every((color) => /^#[0-9A-F]{6}$/i.test(color)),
      message: 'Colors must be valid hex codes.',
    },
  })
  colors: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: String, default: 'default-product.jpg' })
  imageCover: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'A product must belong to a category'],
    index: true,
  })
  category: string;

  // @Prop({ type: String, trim: true })
  // brand: string;

  // @Prop({ type: [String], default: [] })
  // tags: string[];

  @Prop({
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must not exceed 5'],
  })
  averageRating: number;

  @Prop({
    type: Number,
    default: 0,
    min: [0, 'Number of ratings must be at least 0'],
  })
  ratingsQuantity: number;

  // @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Review', default: [] })
  // reviews: string[];
}
const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ description: 'text', name: 'text' });

ProductSchema.virtual('priceAfterDiscount').get(function () {
  return this.discountPercentage
    ? this.price - (this.price * this.discountPercentage) / 100
    : this.price;
});

ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Middleware to auto-generate `slug` on updates as well
ProductSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
  next();
});

ProductSchema.pre(/^find/, function (next) {
  (this as Query<ProductDocument[], ProductDocument>).populate({
    path: 'category',
    select: 'name slug',
  });
  next();
});

export { ProductSchema };
