import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './../auth/auth.module';
import { ProductModule } from '../product/product.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CategoryModule } from 'src/category/category.module';
import { Product } from 'src/product/entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { ProductTypesModule } from 'src/product-type/product-type.module';
import { Role } from 'src/user/entities/role.entity';
import { S3Module } from 'src/s3/s3.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([Product, Category, Role]),
    ProductModule,
    UserModule,
    AuthModule,
    CategoryModule,
    ProductTypesModule,
    S3Module
  ]
})
export class SeedModule {}
