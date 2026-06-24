import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';

const mockUser: User = {
  id: 'user-1',
  email: 'tomas@test.com',
} as User;
 
const mockAddress: Address = {
  id: 'addr-1',
  street: 'Av. Corrientes 1234',
  city: 'Buenos Aires',
  province: 'Buenos Aires',
  postal_code: '1043',
  is_default: true,
  user: mockUser,
} as any as Address;

const mockAddressRepository = {
  find: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};
describe('AdressService', () => {
  let service: AddressService;
  let repository: Repository<Address>;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: getRepositoryToken(Address),
          useValue: mockAddressRepository,
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    repository = module.get<Repository<Address>>(getRepositoryToken(Address));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

   describe('get', () => {
    it('debe retornar las direcciones del usuario', async () => {
      mockAddressRepository.find.mockResolvedValue([mockAddress]);
 
      const result = await service.get(mockUser);
 
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(result).toEqual([mockAddress]);
    });
 
    it('debe retornar un array vacío si el usuario no tiene direcciones', async () => {
      mockAddressRepository.find.mockResolvedValue([]);
 
      const result = await service.get(mockUser);
 
      expect(result).toEqual([]);
    });
  });
 
  describe('create', () => {
    const createDto = {
      street: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      province: 'Buenos Aires',
      postal_code: '1043',
      is_default: false,
    } as any as CreateAddressDto;
 
    it('debe marcar como default la primera dirección del usuario', async () => {
      mockAddressRepository.count.mockResolvedValue(0);
      mockAddressRepository.create.mockReturnValue({ ...mockAddress, is_default: true });
      mockAddressRepository.save.mockResolvedValue({ ...mockAddress, is_default: true });
 
      const result = await service.create(createDto, mockUser);
 
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        user: mockUser,
        is_default: true,
      });
      expect(result.is_default).toBe(true);
    });
 
    it('no debe forzar is_default si ya existen otras direcciones y el dto lo trae en false', async () => {
      mockAddressRepository.count.mockResolvedValue(2);
      mockAddressRepository.create.mockReturnValue({ ...mockAddress, is_default: false });
      mockAddressRepository.save.mockResolvedValue({ ...mockAddress, is_default: false });
 
      const result = await service.create(createDto, mockUser);
 
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        user: mockUser,
        is_default: false,
      });
      expect(result.is_default).toBe(false);
    });
 
    it('debe respetar is_default: true del dto aunque no sea la primera dirección', async () => {
      mockAddressRepository.count.mockResolvedValue(2);
      const dtoWithDefault = { ...createDto, is_default: true };
      mockAddressRepository.create.mockReturnValue({ ...mockAddress, is_default: true });
      mockAddressRepository.save.mockResolvedValue({ ...mockAddress, is_default: true });
 
      const result = await service.create(dtoWithDefault, mockUser);
 
      expect(repository.create).toHaveBeenCalledWith({
        ...dtoWithDefault,
        user: mockUser,
        is_default: true,
      });
      expect(result.is_default).toBe(true);
    });
 
    it('debe llamar a save con la dirección creada', async () => {
      mockAddressRepository.count.mockResolvedValue(1);
      mockAddressRepository.create.mockReturnValue(mockAddress);
      mockAddressRepository.save.mockResolvedValue(mockAddress);
 
      await service.create(createDto, mockUser);
 
      expect(repository.save).toHaveBeenCalledWith(mockAddress);
    });
  });
 
  describe('update', () => {
    const updateDto = {
      city: 'Rosario',
    } as UpdateAddressDto;
 
    it('debe actualizar y retornar la dirección', async () => {
      const updatedAddress = { ...mockAddress, city: 'Rosario' };
      mockAddressRepository.update.mockResolvedValue({ affected: 1 });
      mockAddressRepository.findOne.mockResolvedValue(updatedAddress);
 
      const result = await service.update('addr-1', updateDto, mockUser);
 
      expect(repository.update).toHaveBeenCalledWith(
        { id: 'addr-1', user: { id: mockUser.id } },
        updateDto,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'addr-1', user: { id: mockUser.id } },
      });
      expect(result).toEqual(updatedAddress);
    });
 
    it('debe retornar null si la dirección no pertenece al usuario', async () => {
      mockAddressRepository.update.mockResolvedValue({ affected: 0 });
      mockAddressRepository.findOne.mockResolvedValue(null);
 
      const result = await service.update('addr-999', updateDto, mockUser);
 
      expect(result).toBeNull();
    });
  });
 
  describe('delete', () => {
    it('debe eliminar la dirección del usuario', async () => {
      mockAddressRepository.delete.mockResolvedValue({ affected: 1 });
 
      await service.delete('addr-1', mockUser);
 
      expect(repository.delete).toHaveBeenCalledWith({
        id: 'addr-1',
        user: { id: mockUser.id },
      });
    });
 
    it('debe retornar el resultado del delete aunque no afecte filas', async () => {
      const deleteResult = { affected: 0 };
      mockAddressRepository.delete.mockResolvedValue(deleteResult);
 
      const result = await service.delete('addr-999', mockUser);
 
      expect(result).toEqual(deleteResult);
    });
  });
});
