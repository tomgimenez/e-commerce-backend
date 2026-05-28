import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ProductType } from './entities/product-types.entity';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { ProductTypeService } from './product-type.service';

@Controller('product-types')
export class ProductTypeController {

  constructor(
    private readonly productTypeService: ProductTypeService
  ) {}

  @Post()
  // @Auth()
  @ApiResponse({
    status: 201,
    description: 'Product type was created',
    type: ProductType,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  create(@Body() createProductTypeDto: CreateProductTypeDto/* , @GetUser() user: User */) {
    return this.productTypeService.create(createProductTypeDto);
  }

  @Get()
  findAll() {
    return this.productTypeService.findAll();
  }
}
