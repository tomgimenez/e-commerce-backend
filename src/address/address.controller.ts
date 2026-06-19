import { Body, Controller, Delete, Get, Patch, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { AddressService } from './address.service';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../user/decorators/get-user.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Auth } from '../auth/decorators';

@Controller('address')
export class AddressController {

  constructor(
    private readonly addressService: AddressService
  ) {}

  @Get()
  @Auth()
  get(@GetUser() user: User) {
    return this.addressService.get(user);
  }

  @Post()
  @Auth()
  create(@Body() createAddressDto: CreateAddressDto, @GetUser() user: User) {
    return this.addressService.create(createAddressDto, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAddressDto: UpdateAddressDto, @GetUser() user: User) {
    return this.addressService.update(id, updateAddressDto, user);
  }

  @Delete(':id')
  @Auth()
  delete(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.addressService.delete(id, user);
  }
}
