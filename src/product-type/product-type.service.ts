import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductType } from './entities/product-types.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductTypeService {

  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>
  ) {}

  async create (createProductTypeDto: CreateProductTypeDto) {
    try {

      const productType = this.productTypeRepository.create(createProductTypeDto);
      return await this.productTypeRepository.save(productType);
      
    } catch (error) {
      console.log(error)
    }
  }

  async findAll() {
    return await this.productTypeRepository.find();
  }

  async findOne(id: string) {
    let productType: ProductType;
    
    productType = await this.productTypeRepository.findOneBy({ id: id });

    if (!productType) throw new NotFoundException(`Product type with ${id} not found`);

    return productType;
  }

  async deleteAllProductTypes() {
      const query = this.productTypeRepository.createQueryBuilder('product_types');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      console.log(error);
    }
  }
}
