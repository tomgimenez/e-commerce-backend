import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';

import { Product, ProductImage } from './entities';
import { ProductTypesModule } from 'src/product-type/product-type.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    TypeOrmModule.forFeature([ Product, ProductImage ]),
    AuthModule,
    ProductTypesModule,
    S3Module
  ],
  exports: [
    ProductService,
    TypeOrmModule,
  ]
})
export class ProductModule {}
