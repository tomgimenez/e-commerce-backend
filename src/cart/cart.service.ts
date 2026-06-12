import { Injectable } from '@nestjs/common';
import { AddItemDto } from './dto/add-item.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>
  ) {}

  async find(userId: string) {
    return await this.cartRepository.findOne({
      where: { user: { id: userId} },
      relations: ['items', 'items.product']
    });
  }

  async addItem(addItemDto: AddItemDto, userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId }, items: []
      });

      await this.cartRepository.save(cart);
    }

    const existingItem = cart.items.find(item => item.product.id === addItemDto.productId);

    if (existingItem) {
      existingItem.quantity += addItemDto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        product: { id: addItemDto.productId },
        quantity: addItemDto.quantity,
        unitPrice: addItemDto.unitPrice
      });
      await this.cartItemRepository.save(newItem);
    }
  }

  async updateItem(cartItemId: string, updateItemDto: UpdateItemDto, userId: string) {
    const item = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cart: { user: { id: userId } } },
      relations: ['cart', 'cart.user']
    });

    if (!item) 
      throw new Error('item not found');

    if (updateItemDto.quantity === 0) {
      await this.cartItemRepository.remove(item);
      return;
    }
    
    item.quantity = updateItemDto.quantity;
    await this.cartItemRepository.save(item);
  }
}
