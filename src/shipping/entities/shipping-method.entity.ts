import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// shipping-method.entity.ts
@Entity('shipping_methods')
export class ShippingMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number.parseFloat(value),
  } })
  price: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  sort_order: number; // para ordenar en el checkout

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}