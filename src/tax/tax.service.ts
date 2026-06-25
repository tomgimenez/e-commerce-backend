import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tax } from './entities/tax.entity';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxService {

  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>
  ) {}

  create(createTaxDto: CreateTaxDto): Promise<Tax> {
    const tax = this.taxRepository.create(createTaxDto);
    return this.taxRepository.save(tax);
  }

  findAll(): Promise<Tax[]> {
    return this.taxRepository.find({ order: { sort_order: 'ASC' } });
  }

  findOne(id: number): Promise<Tax | null> {
    return this.taxRepository.findOneBy({ id });
  }

  async update(id: number, updateTaxDto: UpdateTaxDto): Promise<Tax | null> {
    await this.taxRepository.update(id, updateTaxDto);
    return this.taxRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.taxRepository.delete(id);
  }
}
