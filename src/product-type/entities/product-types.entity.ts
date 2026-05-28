import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('product_types')
export class ProductType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  slug: string;

  @Column({ type: 'jsonb', nullable: true })
  schema: Record<string, any>;
}