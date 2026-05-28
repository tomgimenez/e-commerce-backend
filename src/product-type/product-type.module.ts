import { Module } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';
import { ProductTypeController } from './product-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-types.entity';

@Module({
  providers: [ProductTypeService],
  controllers: [ProductTypeController],
  imports: [TypeOrmModule.forFeature([ ProductType ])],
  exports: [ProductTypeService]
})
export class ProductTypesModule {}
