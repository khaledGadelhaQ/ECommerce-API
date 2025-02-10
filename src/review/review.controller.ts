import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Roles(Role.Customer)
  @HttpCode(HttpStatus.CREATED)
  async createOne(@Body() review: CreateReviewDto, @Req() req) {
    const reviewDoc = await this.reviewService.createOne({
      ...review,
      user: req.user.id,
    });
    return {
      status: 'success',
      message: 'Review created successfully',
      data: reviewDoc,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query, @Req() req) {
    let filterObject = {};
    if (req.user.role === 'customer') {
      filterObject = {
        user: req.user.id,
      };
    }
    const docs = await this.reviewService.findAll(query, filterObject);
    return {
      status: 'success',
      numOfReviews: docs.results,
      data: docs.data,
    };
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ValidateObjectIdPipe) id: string) {
    const review = await this.reviewService.findOne({ _id: id });
    return {
      status: 'success',
      data: review,
    };
  }

  @Patch('/:id')
  @Roles(Role.Customer)
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() updatedReview: UpdateReviewDto,
    @Req() req,
  ) {
    const review = await this.reviewService.updateOne(
      id,
      req.user.id,
      updatedReview,
    );
    return {
      status: 'success',
      message: 'Review updated successfully',
      data: review,
    };
  }

  @Delete('/:id')
  @Roles(Role.Customer)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(@Param('id', ValidateObjectIdPipe) id: string, @Req() req) {
    await this.reviewService.deleteOne(id, req);
    return;
  }
}
