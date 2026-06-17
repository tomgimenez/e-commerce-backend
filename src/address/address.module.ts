import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressService } from './address.service';
import { Address } from './entities/address.entity';

@Module({
  providers: [AddressService],
  imports: [
    TypeOrmModule.forFeature([ Address ])
  ]
})
export class AddressModule {}
