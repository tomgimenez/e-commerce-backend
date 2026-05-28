import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ValidRoles } from '../user/enums/valid-roles';

@ApiTags('Categories')
@Controller('category')
export class CategoryController {

  constructor(
    private readonly categoryService: CategoryService
  ) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.categoryService.findOne(term);
  }

  @Post()
  @Auth()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
