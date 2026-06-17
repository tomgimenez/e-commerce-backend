import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
  imports: [
    TypeOrmModule.forFeature([ Order, OrderItem ])
  ]
})
export class OrderModule {}
