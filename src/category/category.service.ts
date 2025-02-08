import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import slugify from 'slugify';
import { processAndUploadImage } from 'src/common/utils/file-upload.util';
import { s3 } from 'src/config/aws';

@Injectable()
export class CategoryService extends BaseService<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }

  async uploadImage(
    categoryId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const category = await this.categoryModel.findOne({ _id: categoryId });
    if (category.image !== 'default.category.jpg') {
      await s3
        .deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: category.image,
        })
        .promise();
    }
    const imageUrl = await processAndUploadImage(file, 'categories');
    // update user profile in DB
    await super.update(categoryId, { image: imageUrl });

    return imageUrl;
  }
}
