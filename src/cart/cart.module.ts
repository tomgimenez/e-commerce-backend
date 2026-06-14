import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { S3Module } from 'src/s3/s3.module';

@Module({
  providers: [CartService],
  controllers: [CartController],
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    S3Module
  ]
})
export class CartModule {}
