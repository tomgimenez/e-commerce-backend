import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './../auth/auth.module';
import { ProductsModule } from './../products/products.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CategoryModule } from 'src/category/category.module';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { ProductTypesModule } from 'src/product-types/product-types.module';
import { Role } from 'src/auth/entities/role.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([Product, Category, Role]),
    ProductsModule,
    AuthModule,
    CategoryModule,
    ProductTypesModule
  ]
})
export class SeedModule {}
