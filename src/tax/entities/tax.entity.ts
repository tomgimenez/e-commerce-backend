import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('taxes')
export class Tax {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // 'IVA', 'Percepción IIBB', etc.

  @Column({ type: 'decimal', precision: 5, scale: 4, transformer: {
    to: (value: number) => value,
    from: (value: string) => Number.parseFloat(value),
  }})
  rate: number; // 0.21, 0.05, etc.

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}