import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Address } from '../address/entities/address.entity';
import { ShippingMethod } from '../shipping/entities/shipping-method.entity';
import { Tax } from '../tax/entities/tax.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject('MERCADOPAGO_CLIENT')
    private readonly mpClient: MercadoPagoConfig,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(ShippingMethod)
    private readonly shippingMethodRepository: Repository<ShippingMethod>,

    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    const { cart_id, address_id, shipping_method_id, payment_method } = createOrderDto;

    // 1. Fetch all required data
    const cart = await this.cartRepository.findOne({
      where: { id: cart_id },
      relations: ['items', 'items.product', 'items.product.images'],
    });

    if (!cart) throw new NotFoundException('Cart not found');

    const address = await this.addressRepository.findOneBy({ id: address_id });
    const shippingMethod = await this.shippingMethodRepository.findOneBy({ id: shipping_method_id });
    const taxes = await this.taxRepository.findBy({ is_active: true });

    // 2. Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const shippingCost = Number(shippingMethod.price);

    const taxesTotal = taxes.reduce(
      (sum, tax) => sum + Math.round(subtotal * tax.rate * 100) / 100,
      0
    );

    const total = subtotal + shippingCost + taxesTotal;

    // 3. Build order items
    const orderItems = cart.items.map((item) => {
      const orderItem = new OrderItem();

      orderItem.product = item.product;
      orderItem.snapshot_name = item.product.title;
      orderItem.snapshot_price = item.unitPrice;
      orderItem.quantity = item.quantity;

      return orderItem;
    });

    // 4. Persist order
    const order = this.orderRepository.create({
      user,
      shipping_address: address,
      payment_method,
      status: OrderStatus.PENDING,
      subtotal,
      shipping_cost: shippingCost,
      taxes_total: taxesTotal,
      total,
      shipping_address_snapshot: address,
      shipping_method_snapshot: shippingMethod,
      taxes_snapshot: taxes,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 5. Create MP preference
    const preference = new Preference(this.mpClient);

    const mpPreference = await preference.create({
      body: {
        external_reference: String(savedOrder.id),
        items: cart.items.map((item) => ({
          id: String(item.product.id),
          title: item.product.title,
          quantity: item.quantity,
          unit_price: Number(item.unitPrice),
          currency_id: 'ARS',
        })),
        shipments: {
          cost: shippingCost,
          mode: 'not_specified',
        },
        taxes: taxes.map((tax) => ({
          type: tax.name,
          value: Math.round(subtotal * tax.rate * 100) / 100,
        })),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/checkout/success`,
          failure: `${process.env.FRONTEND_URL}/checkout/failure`,
          pending: `${process.env.FRONTEND_URL}/checkout/pending`,
        },
        // auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/api/order/webhook`,
      },
    });

    // 6. Save preference id on order
    await this.orderRepository.update(savedOrder.id, {
      mp_preference_id: mpPreference.id,
    });

    return { init_point: mpPreference.init_point };
  }

  async handleWebhook(body: any, headers: any) {

    if (body.type !== 'payment') return;

    const paymentId = body.data?.id;
    if (!paymentId) return;

    // Fetch payment details from MP
    const paymentClient = new Payment(this.mpClient);
    const payment = await paymentClient.get({ id: paymentId });

    const orderId = payment.external_reference;
    if (!orderId) return;

    const statusMap: Record<string, OrderStatus> = {
      approved: OrderStatus.PAID,
      rejected: OrderStatus.FAILED,
      cancelled: OrderStatus.CANCELLED,
    };

    const orderStatus = statusMap[payment.status] ?? OrderStatus.PENDING;

    await this.orderRepository.update(
      { id: Number(orderId) },
      {
        mp_payment_id: String(paymentId),
        status: orderStatus,
      }
    );


    // CLEAN THE USER CART
    if (orderStatus === OrderStatus.PAID) {
      const order = await this.orderRepository.findOne({
        where: { id: Number(orderId) },
        relations: ['user'],
      });

      if (order?.user) {
        const cart = await this.cartRepository.findOne({
          where: { user: { id: order.user.id } },
          relations: ['items'],
        });

        if (cart) {
          cart.items = [];
          await this.cartRepository.save(cart);
        }
      }
    }
  }

  async findOne(id: number, user: User): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['items', 'items.product', 'shipping_address'],
    });
  }

  async deleteAllOrders() {
    await this.orderRepository
      .createQueryBuilder()
      .delete()
      .from(Order)
      .execute();
  }
}
