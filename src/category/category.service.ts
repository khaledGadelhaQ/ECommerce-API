import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Category, CategoryDocument } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoryService extends BaseService<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }

  async update(
    id: string,
    updateCategoryDto: Partial<CategoryDocument>,
  ): Promise<CategoryDocument> {
    if (updateCategoryDto.name) {
      updateCategoryDto.slug = slugify(updateCategoryDto.name, { lower: true });
    }
    return super.update(id,updateCategoryDto);
  }
}
