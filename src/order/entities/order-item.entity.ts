import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  product: Product;

  @Column()
  snapshot_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  snapshot_price: number;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;
}