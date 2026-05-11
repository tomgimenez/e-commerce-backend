import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { CategoryService } from 'src/category/category.service';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { ProductTypesService } from 'src/product-types/product-types.service';


@Injectable()
export class SeedService {

  private bookType: string;

  constructor(
    private readonly productsService: ProductsService,
    private readonly categoryService: CategoryService,
    private readonly productTypesService: ProductTypesService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>,

    @InjectRepository( Product )
    private readonly productRepository: Repository<Product>,

    @InjectRepository( Category )
    private readonly categoryRepository: Repository<Category>
  ) {}

  async runSeed() {

    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.insertCategories();
    await this.insertBookType();
    await this.insertNewProducts( adminUser );

    return 'SEED EXECUTED';
  }

  private async deleteTables() {

    await this.productsService.deleteAllProducts();
    await this.productTypesService.deleteAllProductTypes();
    await this.categoryService.deleteAllCategories();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers() {

    const seedUsers = initialData.users;
    
    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create( user ) )
    });

    const dbUsers = await this.userRepository.save( seedUsers )

    return dbUsers[0];
  }

  private async insertCategories() {
    const seedCategories = initialData.categories;

    const insertPromises = [];

    seedCategories.forEach(cat => {
      insertPromises.push(this.categoryService.create(cat));
    });

    await Promise.all(insertPromises);
  }

  private async insertBookType() {
    const seedBookType = initialData.productType;

    const bookType = await this.productTypesService.create(seedBookType);
    // console.log(bookType)

    this.bookType = bookType.id;
  }


  private async insertNewProducts( user: User ) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.createProductWithCategories( {productTypeId: this.bookType, ...product}, user ) );
    });

    await Promise.all( insertPromises );

    return true;
  }

  private async createProductWithCategories( productData: any, user: User ) {
    try {

      console.log(productData)
      // Separate categories from product data
      const { categories: seedCategories, ...productDetails } = productData;
      
      // Create product without categories
      const createdProduct = await this.productsService.create( productDetails, user );
      
      // If there are categories in the seed data, associate them
      if (seedCategories && seedCategories.length > 0) {
        // Get the full product with relations
        const product = await this.productRepository.findOne({
          where: { id: createdProduct.id },
          relations: ['categories']
        });
        
        // Find categories by name
        const categoryNames = seedCategories.map((cat: any) => cat.name);
        const dbCategories = await this.categoryRepository.find({
          where: {
            name: In(categoryNames)
          }
        });
        
        // Assign categories to product
        if (dbCategories.length > 0) {
          product.categories = dbCategories;
          await this.productRepository.save(product);
        }
      }
      
      return createdProduct;
    } catch (error) {
      console.error('Error creating product with categories:', error);
      throw error;
    }
  }


}
