import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-types.entity';

@Module({
  providers: [ProductTypesService],
  controllers: [ProductTypesController],
  imports: [TypeOrmModule.forFeature([ ProductType ])],
  exports: [ProductTypesService]
})
export class ProductTypesModule {}
