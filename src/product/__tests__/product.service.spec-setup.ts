import { Test } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";

import { ProductService } from "../product.service";
import { Product, ProductImage } from "../entities";
import { ProductTypeService } from "../../product-type/product-type.service";
import { S3Service } from "../../s3/s3.service";
import { User } from "../../user/entities/user.entity";

export const createProductServiceTestingModule = async () => {
  const module = await Test.createTestingModule({
    providers: [
      ProductService,
      {
        provide: getRepositoryToken(Product),
        useValue: {
          create: jest.fn(),
          save: jest.fn()
        }
      },
      {
        provide: getRepositoryToken(ProductImage),
        useValue: {
          create: jest.fn(),
          save: jest.fn()
        }
      },
      {
        provide: ProductTypeService,
        useValue: {
          findOne: jest.fn()
        }
      },
      {
        provide: S3Service,
        useValue: {
          buildUrl: jest.fn()
        }
      },
      {
        provide: DataSource,
        useValue: {
          createQueryRunner: jest.fn().mockReturnValue({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: { save: jest.fn(), delete: jest.fn() },
          }),
        },
      }
    ]
  }).compile();

  return {
    service: module.get<ProductService>(ProductService),
    productRepo: module.get(getRepositoryToken(Product)),
    imageRepo: module.get(getRepositoryToken(ProductImage)),
    productTypeService: module.get(ProductTypeService) as jest.Mocked<ProductTypeService>,
    s3Service: module.get(S3Service) as jest.Mocked<S3Service>,
    dataSource: module.get(DataSource) as jest.Mocked<DataSource>,
    mockedUser: {id: '1', email: 'test@test.com'} as User
  }
}