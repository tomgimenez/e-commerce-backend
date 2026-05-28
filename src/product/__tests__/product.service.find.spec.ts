import { Repository } from "typeorm";
import { ProductService } from "../product.service";
import { Product } from "../entities";
import { S3Service } from "../../s3/s3.service";
import { createProductServiceTestingModule } from "../__tests__/product.service.spec-setup";
import { NotFoundException } from "@nestjs/common";

  describe('ProductService - findAll / findOne', () => {
    let mockQueryBuilder: any;
    let service: ProductService;
    let productRepo: jest.Mocked<Repository<Product>>;
    let s3Service: jest.Mocked<S3Service>;

    beforeEach(async () => {
      ({ service, productRepo, s3Service } 
          = await createProductServiceTestingModule());
      mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getCount: jest.fn(),
      };

      productRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated products with default pagination', async () => {
      const mockProducts = [
        { id: '1', title: 'Product 1', images: [{ url: 'img1.jpg' }], categories: [], productType: null },
        { id: '2', title: 'Product 2', images: [], categories: [], productType: null },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockProducts);
      mockQueryBuilder.getCount.mockResolvedValue(2);
      s3Service.buildUrl.mockReturnValue('https://bucket.s3.amazonaws.com/img1.jpg');

      const result = await service.findAll({});

      expect(result).toEqual({
        count: 2,
        pages: 1,
        products: [
          {
            id: '1',
            title: 'Product 1',
            images: [{ url: 'https://bucket.s3.amazonaws.com/img1.jpg', key: 'img1.jpg' }],
            categories: [],
            productType: null,
          },
          { id: '2', title: 'Product 2', images: [], categories: [], productType: null },
        ],
      });
    });

    it('should apply minPrice and maxPrice filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      await service.findAll({ minPrice: 10, maxPrice: 100 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price BETWEEN :minPrice AND :maxPrice',
        { minPrice: 10, maxPrice: 100 }
      );
    });

    it('should apply only minPrice filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      await service.findAll({ minPrice: 10 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: 10 }
      );
    });

    it('should apply only maxPrice filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      await service.findAll({ maxPrice: 100 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        { maxPrice: 100 }
      );
    });

    it('should apply search query filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      await service.findAll({ q: 'nike' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        `(product.title ILIKE :query OR product.attributes::text ILIKE :query)`,
        { query: '%nike%' }
      );
    });

    it('should calculate pages correctly', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(25);

      const result = await service.findAll({ limit: 10 });

      expect(result.pages).toBe(3); // Math.ceil(25/10)
      expect(result.count).toBe(25);
    });

    it('should apply custom limit and offset', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      await service.findAll({ limit: 5, offset: 10 });

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
    });

    describe('findOne', () => {
      let mockQueryBuilder: any;
  
      beforeEach(() => {
        mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          getOne: jest.fn(),
        };
  
        productRepo.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
      });
  
      it('should find a product by UUID', async () => {
        const mockProduct = { id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301', title: 'Test Product' } as Product;
        productRepo.findOneBy = jest.fn().mockResolvedValue(mockProduct);
  
        const result = await service.findOne('3f2504e0-4f89-11d3-9a0c-0305e82c3301');
  
        expect(productRepo.findOneBy).toHaveBeenCalledWith({ id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301' });
        expect(result).toEqual(mockProduct);
      });
  
      it('should find a product by title or slug', async () => {
        const mockProduct = { id: '1', title: 'Test Product', slug: 'test-product' } as Product;
        mockQueryBuilder.getOne.mockResolvedValue(mockProduct);
  
        const result = await service.findOne('test-product');
  
        expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('prod');
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          'UPPER(title) =:title or slug =:slug',
          { title: 'TEST-PRODUCT', slug: 'test-product' }
        );
        expect(result).toEqual(mockProduct);
      });
  
      it('should throw NotFoundException if product not found by UUID', async () => {
        productRepo.findOneBy = jest.fn().mockResolvedValue(null);
  
        await expect(service.findOne('3f2504e0-4f89-11d3-9a0c-0305e82c3301'))
          .rejects
          .toThrow(new NotFoundException('Product with 3f2504e0-4f89-11d3-9a0c-0305e82c3301 not found'));
      });
  
      it('should throw NotFoundException if product not found by slug', async () => {
        mockQueryBuilder.getOne.mockResolvedValue(null);
  
        await expect(service.findOne('non-existent-slug'))
          .rejects
          .toThrow(new NotFoundException('Product with non-existent-slug not found'));
      });
    });
  });