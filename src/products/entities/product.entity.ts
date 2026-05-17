import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    TableInheritance,
    UpdateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { ProductType } from 'src/product-types/entities/product-types.entity';
import { slugify } from 'src/common/utils/slugify.util';

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'The Fellowship of the Ring',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float',{
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Anim reprehenderit nulla in anim mollit minim irure commodo.',
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG - for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: 'lotr',
        description: 'Product tags'
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    // images
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];


    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User

    @ApiProperty({
        example: 4.5,
        description: 'Product rating',
        required: false,
    })
    @Column('float', {
        nullable: true,
        default: null
    })
    rating?: number;

    @ApiProperty({
        example: 150,
        description: 'Number of reviews',
        required: false,
    })
    @Column('int', {
        nullable: true,
        default: null
    })
    reviews?: number;

    @ApiProperty({
        example: [{ id: '1', name: 'Electronics' }],
        description: 'Product categories',
        required: false,
    })
    @ManyToMany(
        () => Category,
        { eager: true }
    )
    @JoinTable()
    categories?: Category[];

    @Column('boolean', {
        default: true
    })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => ProductType, { eager: true })
    productType: ProductType;

    @Column({ type: 'jsonb', nullable: true })
    attributes: Record<string, any>;

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      if (!this.slug && this.title) {
        this.slug = slugify(this.title);
      }
    }
}
