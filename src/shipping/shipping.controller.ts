import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/user/enums/valid-roles';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createShippingMethodDto: CreateShippingMethodDto) {
    return this.shippingService.create(createShippingMethodDto);
  }

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateShippingMethodDto: UpdateShippingMethodDto) {
    return this.shippingService.update(id, updateShippingMethodDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shippingService.remove(id);
  }
}
