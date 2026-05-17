import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { slugify } from "src/common/utils/slugify.util";

@Entity({ name: 'category' })
export class Category {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true
  })
  name: string;

  @Column('text', { unique: true })
  slug?: string;

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
    {
      cascade: true
    }
  )
  children: Category[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = slugify(this.name);
    }
  }
}
