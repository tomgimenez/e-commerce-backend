import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { isUUID } from 'class-validator';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  async findAll() {
    return this.categoryRepository.find();
  }

  async findOne(term: string) {
    let category: Category;

    if (isUUID(term)) {
      category = await this.categoryRepository.findOneBy({id: term})
    } else {
      throw new BadRequestException('uuid not valid');
    }

    if (!category) throw new NotFoundException(`Category with ${term} not found`);

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {

      const category = this.categoryRepository.create(createCategoryDto);

      return await this.categoryRepository.save(category);

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id:string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({ id, ...updateCategoryDto });

    if (!category)
      throw new NotFoundException(`Category with id: ${id} not found`);

    return await this.categoryRepository.save( category );
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);

    return 'category deleted.';
  }

  async deleteAllCategories() {
    const query = this.categoryRepository.createQueryBuilder('category');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
