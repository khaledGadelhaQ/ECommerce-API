import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Product,
  ProductDocument,
} from './schemas/product.schema';
import { BaseService } from 'src/common/services/base.service';
import { Model } from 'mongoose';

@Injectable()
export class ProductService extends BaseService<ProductDocument> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }
}
