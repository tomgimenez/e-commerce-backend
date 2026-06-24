import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingService } from './shipping.service';
import { ShippingMethod } from './entities/shipping-method.entity';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

const mockShippingMethod: ShippingMethod = {
  id: 1,
  name: 'Standard Shipping',
  description: 'Delivery in 5-7 business days',
  price: 5.99,
  is_active: true,
  sort_order: 0,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ShippingService', () => {
  let service: ShippingService;
  let repository: Repository<ShippingMethod>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        {
          provide: getRepositoryToken(ShippingMethod),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
    repository = module.get<Repository<ShippingMethod>>(getRepositoryToken(ShippingMethod));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a shipping method', async () => {
      const dto: CreateShippingMethodDto = {
        name: 'Standard Shipping',
        description: 'Delivery in 5-7 business days',
        price: 5.99,
      };

      mockRepository.create.mockReturnValue(mockShippingMethod);
      mockRepository.save.mockResolvedValue(mockShippingMethod);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockShippingMethod);
      expect(result).toEqual(mockShippingMethod);
    });
  });

  describe('findAll', () => {
    it('should return an array of shipping methods ordered by sort_order', async () => {
      const mockList = [mockShippingMethod];
      mockRepository.find.mockResolvedValue(mockList);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { sort_order: 'ASC' } });
      expect(result).toEqual(mockList);
    });

    it('should return an empty array when there are no shipping methods', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a shipping method by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockShippingMethod);

      const result = await service.findOne(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockShippingMethod);
    });

    it('should return null when shipping method is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated shipping method', async () => {
      const dto: UpdateShippingMethodDto = { price: 9.99 };
      const updated = { ...mockShippingMethod, price: 9.99 };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, dto);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(updated);
    });

    it('should return null when updating a non-existent shipping method', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.update(999, { price: 9.99 });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a shipping method', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should complete without error when deleting a non-existent id', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).resolves.toBeUndefined();
    });
  });
});