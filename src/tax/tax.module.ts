import { Module } from '@nestjs/common';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tax } from './entities/tax.entity';

@Module({
  controllers: [TaxController],
  providers: [TaxService],
  imports: [
    TypeOrmModule.forFeature([ Tax ])
  ],
  exports: [TaxService]
})
export class TaxModule {}
