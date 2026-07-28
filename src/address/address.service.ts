import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { User } from '../user/entities/user.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>
  ) {}

  async get(user: User) {
    return this.addressRepository.find({
      where: { user: { id: user.id } }
    });
  }

  async create(createAddressDto: CreateAddressDto, user: User) {
    // Verificar si es la primera dirección del usuario
    const existingAddresses = await this.addressRepository.count({
      where: { user: { id: user.id } }
    });

    const isFirstAddress = existingAddresses === 0;

    const address = this.addressRepository.create({
      ...createAddressDto,
      user,
      is_default: isFirstAddress || createAddressDto.is_default
    });
    return this.addressRepository.save(address);
  }

  async update(id: string, updateAddressDto: UpdateAddressDto, user: User) {
    await this.addressRepository.update(
      { id, user: { id: user.id } },
      updateAddressDto
    );
    return this.addressRepository.findOne({
      where: { id, user: { id: user.id } }
    });
  }

  async delete(id: string, user: User) {
    return this.addressRepository.delete({
      id,
      user: { id: user.id }
    });
  }

  async deleteAllAddresses() {
    await this.addressRepository
      .createQueryBuilder()
      .delete()
      .from(Address)
      .execute();
  }
}
