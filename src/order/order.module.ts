import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { MercadoPagoProvider } from './mercadopago.provider';
import { Cart } from 'src/cart/entities/cart.entity';
import { Address } from 'src/address/entities/address.entity';
import { ShippingMethod } from 'src/shipping/entities/shipping-method.entity';
import { Tax } from 'src/tax/entities/tax.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [OrderService, MercadoPagoProvider],
  controllers: [OrderController],
  imports: [
    TypeOrmModule.forFeature([ Order, OrderItem, Cart, Address, ShippingMethod, Tax ]),
    ConfigModule
  ]
})
export class OrderModule {}
