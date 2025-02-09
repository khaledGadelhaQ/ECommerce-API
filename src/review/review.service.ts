import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Review, ReviewDocument } from './schemas/review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductService } from 'src/product/product.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class ReviewService extends BaseService<ReviewDocument> {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
  ) {
    super(reviewModel);
  }

  async createOne(
    review: CreateReviewDto & { user: string },
  ): Promise<ReviewDocument> {
    const { user: userId, product: productId, rating } = review;

    // check if product exits
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Product not found!');
    // check if user purchased the product
    const order = await this.hasUserPurchasedProduct(userId, productId);
    if (!order)
      throw new BadRequestException(
        'You must purchase the product before reviewing it',
      );

    // check if user already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview)
      throw new BadRequestException('You already reviewed this product');
    // ✅ Create review
    const reviewDoc = await this.reviewModel.create(review);
    // ✅ Update product ratings
    await this.updateProductRating(productId);

    return reviewDoc;
  }

  async updateOne(
    reviewId: string,
    userId: string,
    updatedReviewDto: Partial<ReviewDocument>,
  ): Promise<ReviewDocument> {
    // check user alreaday reviewed this product
    const review = await this.reviewModel.exists({ user: userId });
    if (!review)
      throw new BadRequestException(
        'You have not reviewed this product before',
      );

    const updatedReview = await super.update(reviewId, updatedReviewDto);

    await this.updateProductRating(updatedReview.product as string);

    return updatedReview;
  }

  async deleteOne(reviewId: string, req: any): Promise<void> {
    // check user alreaday reviewed this product
    const review = await super.findOne({ _id: reviewId });
    if (!review) throw new NotFoundException('Review not found');
    console.log(review.user, req.user.id);
    if (req.user.role === 'customer' && review.user.toString() !== req.user.id)
      throw new BadRequestException(
        'You have not reviewed this product before',
      );

    await super.delete(reviewId);

    await this.updateProductRating(review.product as string);
  }

  private async hasUserPurchasedProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    return !!(await this.orderService.exists({
      user: userId,
      'items.product': productId,
      isPaid: true,
    }));
  }

  private async updateProductRating(productId: string) {
    // Fetch all reviews for the given product
    const reviews = await this.reviewModel.find({ product: productId });

    // If no reviews exist, reset ratings to default
    if (reviews.length === 0) {
      await this.productService.update(productId, {
        averageRating: 0,
        ratingsQuantity: 0,
      });
      return;
    }

    // Calculate new average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1)); // Keep 1 decimal place

    // Call ProductService to update the product
    await this.productService.update(productId, {
      averageRating,
      ratingsQuantity: reviews.length,
    });
  }
}
