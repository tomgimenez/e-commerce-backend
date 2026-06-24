import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';
import { Repository } from 'typeorm';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

@Injectable()
export class ShippingService {

  constructor(
    @InjectRepository(ShippingMethod)
    private readonly shippingRepository: Repository<ShippingMethod>
  ) {}

  create(createShippingMethodDto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const shippingMethod = this.shippingRepository.create(createShippingMethodDto);
    return this.shippingRepository.save(shippingMethod);
  }

  findAll(): Promise<ShippingMethod[]> {
    return this.shippingRepository.find({ order: { sort_order: 'ASC' } });
  }

  findOne(id: number): Promise<ShippingMethod | null> {
    return this.shippingRepository.findOneBy({ id });
  }

  async update(id: number, updateShippingMethodDto: UpdateShippingMethodDto): Promise<ShippingMethod | null> {
    await this.shippingRepository.update(id, updateShippingMethodDto);
    return this.shippingRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.shippingRepository.delete(id);
  }
}