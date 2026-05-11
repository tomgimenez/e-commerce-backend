import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";

@Entity({ name: 'category' })
export class Category {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @ManyToMany(
    () => Product,
    (product) => product.categories,
  )
  products: Product[];

  @ManyToOne(
    () => Category,
    (category) => category.children,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  parent?: Category;

  @OneToMany(
    () => Category,
    (category) => category.parent,
  )
  children: Category[];
}
