import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import slugify from 'slugify';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, lowercase: true })
  slug: string;

  @Prop({ type: String, default: '' })
  image: string;
}

const CategorySchema = SchemaFactory.createForClass(Category);

// Create a text index for name field (To enable searching)
CategorySchema.index({ name: 'text' });

CategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  return next();
});
export { CategorySchema };
