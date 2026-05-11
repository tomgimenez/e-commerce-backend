import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from './../auth/auth.module';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { Product, ProductImage } from './entities';
import { ProductTypesModule } from 'src/product-types/product-types.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([ Product, ProductImage ]),
    AuthModule,
    ProductTypesModule
  ],
  exports: [
    ProductsService,
    TypeOrmModule,
  ]
})
export class ProductsModule {}
