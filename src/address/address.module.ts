import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { AddressController } from './address.controller';

@Module({
  providers: [AddressService],
  imports: [
    TypeOrmModule.forFeature([ Address ])
  ],
  controllers: [AddressController]
})
export class AddressModule {}
