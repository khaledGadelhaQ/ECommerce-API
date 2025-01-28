import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import slugify from 'slugify';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  // Name field with added validation and search optimization
  @Prop({
    type: String,
    required: [true, 'Category name is required.'],
    unique: true,
    trim: true,
    minlength: [3, 'Category name must be at least 3 characters long.'],
    maxlength: [50, 'Category name cannot exceed 50 characters.'],
    index: true, // Adds a single field index for efficient searching
  })
  name: string;

  // Slug field with validation and default logic for creation
  @Prop({
    type: String,
    lowercase: true,
    trim: true,
    index: true, // Index to optimize search or filtering by slug
  })
  slug: string;

  // Image URL with added validation for URL format
  @Prop({
    type: String,
    default: 'default.category.jpg',
    validate: {
      validator: function (value: string): boolean {
        // Basic URL format validation
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(value) || value === '';
      },
      message: 'Image must be a valid URL pointing to an image file.',
    },
  })
  image: string;

  // Description field for more context (optional)
  @Prop({
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters.'],
  })
  description?: string;
}

// Create the Mongoose Schema
const CategorySchema = SchemaFactory.createForClass(Category);

// Compound index for improved text search (name and description)
CategorySchema.index({ name: 'text', description: 'text' });

// Middleware to generate slug before saving/updating
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Middleware to auto-generate `slug` on updates as well
CategorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
  next();
});

// Export the Schema
export { CategorySchema };
