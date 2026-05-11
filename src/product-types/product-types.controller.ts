import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ProductType } from './entities/product-types.entity';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { GetUser } from 'src/auth/decorators';
import { ProductTypesService } from './product-types.service';

@Controller('product-types')
export class ProductTypesController {

  constructor(
    private readonly productTypesService: ProductTypesService
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
    return this.productTypesService.create(createProductTypeDto);
  }
}
