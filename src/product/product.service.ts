import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { BaseService } from 'src/common/services/base.service';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class ProductService extends BaseService<ProductDocument> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }

  async bulkUpdateStock(updates: { productId: string; quantity: number }[]): Promise<void> {
    const bulkOps = updates.map(({ productId, quantity }) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { quantity: -quantity, sold: quantity } },
      },
    }));
  
    if (bulkOps.length > 0) {
      await this.productModel.bulkWrite(bulkOps);
    }
  }
  
}
