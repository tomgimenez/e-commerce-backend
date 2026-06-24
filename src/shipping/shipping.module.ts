import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';

@Module({
  providers: [ShippingService],
  controllers: [ShippingController],
  imports: [
    TypeOrmModule.forFeature([ShippingMethod])
  ]
})
export class ShippingModule {}
