import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { BaseService } from 'src/common/services/base.service';
import { ClientSession, Model } from 'mongoose';
import {
  processAndUploadImage,
  processAndUploadMultipleImages,
} from 'src/common/utils/file-upload.util';
import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
  console.log('Redis Client Error', err);
  throw new Error(err);
});

@Injectable()
export class ProductService
  extends BaseService<ProductDocument>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }

  // Initialize Redis connection on module start
  async onModuleInit() {
    try {
      await client.connect();
      console.log('Redis connected');
    } catch (err) {
      console.error('Error connecting to Redis:', err);
    }
  }

  // Cleanly disconnect Redis on module shutdown
  async onModuleDestroy() {
    await client.quit(); // Gracefully disconnect Redis
    console.log('Redis client disconnected gracefully');
  }

  // Fetch product with cache logic
  async findOne(
    productId: string,
    session?: ClientSession,
  ): Promise<ProductDocument> {
    // Check if the product is in the cache
    const cachedProduct = await client.get(`product:${productId}`);

    if (cachedProduct) {
      console.log(`Cache Hit ✅ for product:${productId}`);
      return JSON.parse(cachedProduct); // Return the cached product
    }

    console.log(`Cache Miss ❌ for product:${productId}`);
    // If not in cache, fetch from the database
    const product = await super.findOne({ _id: productId }, session);

    // Cache the product data for future use
    await client.set(`product:${productId}`, JSON.stringify(product), {
      EX: 600,
    });

    return product; // Return the product from DB
  }

  // Update product and handle cache invalidation
  async updateOne(
    productId: string,
    updatedProductDto: Partial<ProductDocument>,
  ): Promise<ProductDocument> {
    const updatedProduct = await super.update(productId, updatedProductDto);

    // Delete the old cached product
    await client.del(`product:${productId}`);

    // Set the updated product in the cache
    await client.set(`product:${productId}`, JSON.stringify(updatedProduct), {
      EX: 600,
    });

    return updatedProduct;
  }

  // Delete product and invalidate cache
  async deleteOne(productId: string): Promise<void> {
    // Delete product from the cache
    await client.del(`product:${productId}`);
    await super.delete(productId);
  }

  // Bulk update the stock for products
  async bulkUpdateStock(
    updates: { productId: string; quantity: number }[],
  ): Promise<void> {
    const bulkOps = updates.map(({ productId, quantity }) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { quantity: -quantity, sold: quantity } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.productModel.bulkWrite(bulkOps); // Perform bulk update
    }
  }

  // Handle image upload for a product
  async uploadImages(
    productId: string,
    imageCover: Express.Multer.File,
    images: Express.Multer.File[],
  ): Promise<{ imageCoverUrl: string; imagesUrls: string[] }> {
    // Process and upload the cover image and other images
    const imageCoverUrl = await processAndUploadImage(imageCover, 'products');
    const imagesUrls = await processAndUploadMultipleImages(images, 'products');

    // Update product record with the image URLs
    await super.update(productId, {
      imageCover: imageCoverUrl,
      images: imagesUrls,
    });

    return { imageCoverUrl, imagesUrls };
  }
}
