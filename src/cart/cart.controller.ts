import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { AddItemDto } from './dto/add-item.dto';
import { CartService } from './cart.service';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../user/decorators/get-user.decorator';
import { Auth } from '../auth/decorators';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('cart')
export class CartController {

  constructor(
    private readonly cartService: CartService
  ) {}

  @Get()
  @Auth()
  async getByUserId(@GetUser() user: User) {
    return await this.cartService.find(user.id)
  }

  @Post('add-item')
  @Auth()
  async addItem(@Body() addItemDto: AddItemDto, @GetUser() user: User) {
    await this.cartService.addItem(addItemDto, user.id);
  }

  @Patch('update-item/:cartItemId')
  @Auth()
  async updateItem(
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
    @Body() updateItemDto: UpdateItemDto, 
    @GetUser() user: User
  ) {
    await this.cartService.updateItem(cartItemId, updateItemDto, user.id);
  }

  @Delete('delete-item/:cartItemId')
  @Auth()
  async deleteItem(@Param('cartItemId', ParseUUIDPipe) cartItemId: string) {
    return await this.cartService.deleteItem(cartItemId);
  }
}
