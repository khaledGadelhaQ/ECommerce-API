import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { OrderModule } from 'src/order/order.module';
import { Product } from 'src/product/schemas/product.schema';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    OrderModule,
    ProductModule,
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
