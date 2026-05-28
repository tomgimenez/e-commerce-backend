import { BadRequestException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { ProductService } from "../product.service";
import { Product, ProductImage } from "../entities";
import { ProductTypeService } from "src/product-type/product-type.service";
import { S3Service } from "../../s3/s3.service";
import { createProductServiceTestingModule } from "./product.service.spec-setup";
import { CreateProductDto } from "../dto/create-product.dto";
import { ProductType } from "../../product-type/entities/product-types.entity";
import { User } from "../../user/entities/user.entity";

describe('ProductService - create', () => {

  let service: ProductService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let imageRepo: jest.Mocked<Repository<ProductImage>>;
  let productTypeService: jest.Mocked<ProductTypeService>;
  let s3Service: jest.Mocked<S3Service>;
  let dataSource: jest.Mocked<DataSource>;
  let mockedUser: User;

  beforeEach(async () => {
    ({ service, productRepo, imageRepo, productTypeService, s3Service, dataSource, mockedUser } 
      = await createProductServiceTestingModule());
  });

  it('should create a product and return it', async () => {
    const mockedImages = ['testImage.jpg'];
    const mockedProductDto = { 
      title: 'test product',
      images: mockedImages,
      attributes: {
        testField: 'test field'
      },
      productTyeId: '1'
    } as unknown as CreateProductDto;
    const returnedProduct = {
      id: '1',
      title: 'test product'
    } as Product

    productTypeService.findOne.mockResolvedValue({
      productTypeId: '1',
      schema: {
        testField: {
          type: 'string',
          required: true
        }
      }
    } as unknown as ProductType);

    imageRepo.create.mockReturnValue({url: mockedImages[0]} as ProductImage);
    productRepo.create.mockReturnValue(returnedProduct);

    const result = await service.create(mockedProductDto, mockedUser);

    expect(result).toStrictEqual({images: mockedImages, ...returnedProduct});
  });

  it('should throw BadRequestException if validateAttributes fail', async () => {
    const mockedProduct = {
      title: 'test product',
      productTypeId: '1',
      attributes: {
        wrongField: 'wrong test field'
      }
    } as unknown as CreateProductDto;
    productTypeService.findOne.mockResolvedValue({
      productTypeId: '1',
      schema: {
        testField: {
          type: 'string',
          required: true
        }
      }
    } as unknown as ProductType);
    
    await expect(
      service.create(mockedProduct, mockedUser)
    ).rejects.toThrow(new BadRequestException(`Attribute 'testField' is required`))
  });
})