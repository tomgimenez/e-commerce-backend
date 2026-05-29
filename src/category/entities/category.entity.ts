import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { slugify } from "../../common/utils/slugify.util";
import { ProductType } from "../../product-type/entities/product-types.entity";

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

  @ManyToOne(
    () => ProductType, { nullable: true }
  )
  productType: ProductType

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = slugify(this.name);
    }
  }
}
