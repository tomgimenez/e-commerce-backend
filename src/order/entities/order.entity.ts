import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { User } from "../../user/entities/user.entity";
import { Address } from "../../address/entities/address.entity";

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  MERCADO_PAGO = 'mercado_pago',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  // Snapshots
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number.parseFloat(value),
  }})
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number.parseFloat(value),
  }})
  shipping_cost: number;

  @ManyToOne(() => Address, (address) => address.orders)
  shipping_address: Address;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number.parseFloat(value),
  }})
  taxes_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number.parseFloat(value),
  }})
  total: number;

  @Column({ type: 'jsonb' })
  shipping_address_snapshot: object;

  @Column({ type: 'jsonb' })
  shipping_method_snapshot: object;

  @Column({ type: 'jsonb' })
  taxes_snapshot: object[];

  @Column({ nullable: true })
  mp_preference_id: string;

  @Column({ nullable: true })
  mp_payment_id: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}