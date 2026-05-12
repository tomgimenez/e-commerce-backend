import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";

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
      this.slug = this.slugify(this.name);
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')                    // descompone acentos: é → e +  ́
      .replace(/[\u0300-\u036f]/g, '')     // elimina los diacríticos
      .replace(/[^a-z0-9\s-]/g, '')        // elimina caracteres especiales
      .trim()
      .replace(/\s+/g, '-')               // espacios → guiones
      .replace(/-+/g, '-');               // guiones múltiples → uno solo
  }
}
