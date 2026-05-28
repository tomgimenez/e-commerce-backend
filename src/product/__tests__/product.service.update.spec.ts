import { DataSource, Repository } from "typeorm";
import { ProductService } from "../product.service";
import { createProductServiceTestingModule } from "./product.service.spec-setup";
import { Product, ProductImage } from "../entities";
import { S3Service } from "src/s3/s3.service";
import { User } from "src/user/entities/user.entity";
import { NotFoundException } from "@nestjs/common";

  describe('update', () => {

    let service: ProductService;
    let productRepo: jest.Mocked<Repository<Product>>;
    let imageRepo: jest.Mocked<Repository<ProductImage>>;
    let s3Service: jest.Mocked<S3Service>;
    let dataSource: jest.Mocked<DataSource>;
    let mockedUser: User;
    let mockQueryRunner: any;
    const validUUID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

    beforeEach(async () => {

      ({ service, productRepo, imageRepo, s3Service, dataSource, mockedUser } 
        = await createProductServiceTestingModule());
      mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn(),
          delete: jest.fn(),
        },
      };

      dataSource.createQueryRunner = jest.fn().mockReturnValue(mockQueryRunner);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepo.preload = jest.fn().mockResolvedValue(null);

      await expect(service.update(validUUID, {}, mockedUser))
        .rejects
        .toThrow(new NotFoundException(`Product with id: ${validUUID} not found`));

      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('should update a product without images', async () => {
      const mockProduct = { id: validUUID, title: 'Updated Product' } as Product;
      productRepo.preload = jest.fn().mockResolvedValue(mockProduct);
      jest.spyOn(service, 'findOnePlain').mockResolvedValue(mockProduct as any);

      const result = await service.update(validUUID, { title: 'Updated Product' }, mockedUser);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith({ ...mockProduct, user: mockedUser });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should delete old images and set new ones when images are provided', async () => {
      const mockProduct = { id: validUUID, title: 'Product', images: [] } as Product;
      const currentImages = [
        { id: 'img1', url: 'old-image.jpg' },
        { id: 'img2', url: 'keep-image.jpg' },
      ] as unknown as ProductImage[];

      productRepo.preload = jest.fn().mockResolvedValue(mockProduct);
      imageRepo.find = jest.fn().mockResolvedValue(currentImages);
      imageRepo.create = jest.fn().mockImplementation((dto) => dto as ProductImage);
      s3Service.deleteByKey = jest.fn().mockResolvedValue(undefined);
      jest.spyOn(service, 'findOnePlain').mockResolvedValue(mockProduct as any);

      await service.update(validUUID, { images: ['keep-image.jpg', 'new-image.jpg'] }, mockedUser);

      // should delete only the image not present in the new list
      expect(s3Service.deleteByKey).toHaveBeenCalledTimes(1);
      expect(s3Service.deleteByKey).toHaveBeenCalledWith('old-image.jpg');

      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(ProductImage, { product: { id: validUUID } });

      expect(imageRepo.create).toHaveBeenCalledWith({ url: 'keep-image.jpg' });
      expect(imageRepo.create).toHaveBeenCalledWith({ url: 'new-image.jpg' });
    });

    it('should rollback transaction and call handleDBExceptions on error', async () => {
      const mockProduct = { id: validUUID, title: 'Product' } as Product;
      const mockError = new Error('DB error');

      productRepo.preload = jest.fn().mockResolvedValue(mockProduct);
      mockQueryRunner.manager.save = jest.fn().mockRejectedValue(mockError);
      jest.spyOn(service as any, 'handleDBExceptions').mockImplementation(() => {});

      await service.update(validUUID, { title: 'Updated' }, mockedUser);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect((service as any).handleDBExceptions).toHaveBeenCalledWith(mockError);
    });

    it('should not call s3Service.deleteByKey if all current images are kept', async () => {
      const mockProduct = { id: validUUID, images: [] } as Product;
      const currentImages = [{ id: 'img1', url: 'keep.jpg' }] as unknown as ProductImage[];

      productRepo.preload = jest.fn().mockResolvedValue(mockProduct);
      imageRepo.find = jest.fn().mockResolvedValue(currentImages);
      imageRepo.create = jest.fn().mockImplementation((dto) => dto as ProductImage);
      s3Service.deleteByKey = jest.fn();
      jest.spyOn(service, 'findOnePlain').mockResolvedValue(mockProduct as any);

      await service.update(validUUID, { images: ['keep.jpg'] }, mockedUser);

      expect(s3Service.deleteByKey).not.toHaveBeenCalled();
    });
  });