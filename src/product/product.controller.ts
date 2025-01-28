import {
  BadRequestException,
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
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';
import { ProductService } from './product.service';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoryService } from 'src/category/category.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: any) {
    const documents = await this.productService.findAll(query);
    return {
      status: 'success',
      message: `${documents.results} product(s) found`,
      data: documents.data,
    };
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ValidateObjectIdPipe) id: string) {
    const product = await this.productService.findOne({ _id: id });
    return {
      status: 'success',
      data: { product },
    };
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    if (updateProductDto.category) {
      const categoryExists = await this.categoryService.findOne({
        _id: updateProductDto.category,
      });
      if (!categoryExists) {
        throw new BadRequestException('Category does not exist');
      }
    }
    const product = await this.productService.update(id, updateProductDto);
    return {
      status: 'success',
      message: 'Product updated successfully!',
      data: { product },
    };
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  async deleteOne(@Param('id', ValidateObjectIdPipe) id: string) {
    await this.productService.delete(id);
    return;
  }

  @Roles(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async createUser(@Body() createProductDto: CreateProductDto) {
    const categoryExists = await this.categoryService.findOne({
      _id: createProductDto.category,
    });
    if (!categoryExists) {
      throw new BadRequestException('Category does not exist');
    }
    const product = await this.productService.create(createProductDto);
    return {
      status: 'success',
      message: 'Category created successfully!',
      data: { product },
    };
  }
}
