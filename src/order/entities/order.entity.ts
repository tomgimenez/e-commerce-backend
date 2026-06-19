import { User } from '../../user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Address } from '../../address/entities/address.entity';


export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.orders, { onDelete: 'RESTRICT' })
  user: User;

  @ManyToOne(() => Address, address => address.orders, { onDelete: 'RESTRICT' })
  shipping_address: Address;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  // @OneToOne(() => Payment, payment => payment.order, { cascade: true })
  // payment: Payment;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @CreateDateColumn()
  created_at: Date;
}