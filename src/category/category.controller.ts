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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';
import { CategoryService } from './category.service';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: any) {
    const documents = await this.categoryService.findAll(query);
    return {
      status: 'success',
      message: `${documents.results} category(s) found`,
      data: documents.data,
    };
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ValidateObjectIdPipe) id: string) {
    const category = await this.categoryService.findOne({ _id: id });
    return {
      status: 'success',
      data: { category },
    };
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() updateCategory: UpdateCategoryDTO,
  ) {
    const category = await this.categoryService.update(id, updateCategory);
    return {
      status: 'success',
      message: 'Category updated successfully!',
      data: { category },
    };
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  async deleteOne(@Param('id', ValidateObjectIdPipe) id: string) {
    await this.categoryService.delete(id);
    return;
  }

  @Roles(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async createUser(@Body() createCategory: CreateCategoryDTO) {
    const category = await this.categoryService.create(createCategory);
    return {
      status: 'success',
      message: 'Category created successfully!',
      data: { category },
    };
  }

  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @Post('/upload-image/:id')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ValidateObjectIdPipe) id: string,
  ) {
    const imageUrl = await this.categoryService.uploadImage(id, file);
    return {
      status: 'success',
      message: 'Category image has been uploaded successfully',
      imageUrl,
    };
  }
}
