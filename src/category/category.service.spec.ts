import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { CategoryService } from "./category.service";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

describe('CategoryService', () => {

  let service: CategoryService;
  let categoryRepo: jest.Mocked<Repository<Category>>;
  const validUUID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

  beforeEach(async ()=> {
    const module = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            preload: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get(CategoryService);
    categoryRepo = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a category by its uuid', async () => {
    const mockedCategory = {
      id: validUUID,
      name: 'category test'
    } as Category;
    categoryRepo.findOneBy.mockResolvedValue(mockedCategory);

    const result = await service.findOne(validUUID);

    expect(result).toStrictEqual(mockedCategory);
  });

  it('should throw BadRequestException when uuid not valid', async () => {
    await expect(
      service.findOne('1e7ac6c5')
    ).rejects.toThrow(new BadRequestException('uuid not valid'))
  });

  it('should throw NotFoundException when category not found', async () => {
    categoryRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.findOne(validUUID)
    ).rejects.toThrow(new NotFoundException(`Category with ${validUUID} not found`));
  });

  it('should create and return a category', async () => {
    const dto = { name: 'Fiction' } as CreateCategoryDto;
    const mockCategory = { id: '1', name: 'Fiction', slug: 'fiction' } as Category;

    categoryRepo.create.mockReturnValue(mockCategory);
    categoryRepo.save.mockResolvedValue(mockCategory);

    const result = await service.create(dto);

    expect(categoryRepo.create).toHaveBeenCalledWith(dto);
    expect(categoryRepo.save).toHaveBeenCalledWith(mockCategory);
    expect(result).toEqual(mockCategory);
  });

  it('should throw BadRequestException on duplicate entry', async () => {
    const dto = { name: 'Fiction' } as CreateCategoryDto;
    const mockCategory = { id: '1', name: 'Fiction' } as Category;

    categoryRepo.create.mockReturnValue(mockCategory);
    categoryRepo.save.mockRejectedValue({ code: '23505', detail: 'Key (name)=(Fiction) already exists.' });

    await expect(service.create(dto))
      .rejects
      .toThrow(new BadRequestException('Key (name)=(Fiction) already exists.'));
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const dto = { name: 'Fiction' } as CreateCategoryDto;
    const mockCategory = { id: '1', name: 'Fiction' } as Category;

    categoryRepo.create.mockReturnValue(mockCategory);
    categoryRepo.save.mockRejectedValue(new Error('unexpected'));

    await expect(service.create(dto))
      .rejects
      .toThrow(new InternalServerErrorException('Unexpected error, check server logs'));
  });

  it('should update and return the category', async () => {
    const dto = { name: 'Updated Fiction' } as UpdateCategoryDto;
    const mockCategory = { id: validUUID, name: 'Updated Fiction', slug: 'updated-fiction' } as Category;

    categoryRepo.preload.mockResolvedValue(mockCategory);
    categoryRepo.save.mockResolvedValue(mockCategory);

    const result = await service.update(validUUID, dto);

    expect(categoryRepo.preload).toHaveBeenCalledWith({ id: validUUID, ...dto });
    expect(categoryRepo.save).toHaveBeenCalledWith(mockCategory);
    expect(result).toEqual(mockCategory);
  });

  it('should throw NotFoundException if category not found', async () => {
    categoryRepo.preload.mockResolvedValue(null);

    await expect(service.update(validUUID, {}))
      .rejects
      .toThrow(new NotFoundException(`Category with id: ${validUUID} not found`));

    expect(categoryRepo.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException on duplicate entry', async () => {
    const dto = { name: 'Existing Category' } as UpdateCategoryDto;
    const mockCategory = { id: validUUID, name: 'Existing Category' } as Category;

    categoryRepo.preload.mockResolvedValue(mockCategory);
    categoryRepo.save.mockRejectedValue({ code: '23505', detail: 'Key (name)=(Existing Category) already exists.' });

    await expect(service.update(validUUID, dto))
      .rejects
      .toThrow(new BadRequestException('Key (name)=(Existing Category) already exists.'));
  });
});