import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { S3Service } from '../s3/s3.service';

describe('CartService', () => {
  let service: CartService;
  let mockCartRepository;
  let mockCartItemRepository;

  const mockUserId = 'user-123';
  const mockProductId = 'product-456';
  const mockCartItemId = 'cart-item-789';

  beforeEach(async () => {
    mockCartRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockCartItemRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockCartRepository,
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockCartItemRepository,
        },
        {
          provide: S3Service,
          useValue: { buildUrl: jest.fn((key) => `https://s3.bucket/${key}`) },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('should create a new cart if it does not exist', async () => {
      const addItemDto = { cartId: undefined, productId: mockProductId, quantity: 2, unitPrice: 100 };
      const newCart = {
        id: 'cart-id',
        user: { id: mockUserId },
        items: [],
      };

      mockCartRepository.findOne.mockResolvedValue(null);
      mockCartRepository.create.mockReturnValue(newCart);
      mockCartRepository.save.mockResolvedValue(newCart);
      mockCartItemRepository.create.mockReturnValue({
        id: mockCartItemId,
        cart: newCart,
        product: { id: mockProductId },
        quantity: 2,
        unitPrice: 100,
      });
      mockCartItemRepository.save.mockResolvedValue({
        id: mockCartItemId,
        cart: newCart,
        product: { id: mockProductId },
        quantity: 2,
        unitPrice: 100,
      });

      await service.addItem(addItemDto, mockUserId);

      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUserId } },
        relations: ['items', 'items.product'],
      });
      expect(mockCartRepository.create).toHaveBeenCalledWith({
        user: { id: mockUserId },
        items: [],
      });
      expect(mockCartRepository.save).toHaveBeenCalled();
    });

    it('should add a new item to an existing cart', async () => {
      const addItemDto = { cartId: undefined, productId: mockProductId, quantity: 2, unitPrice: 100 };
      const existingCart = {
        id: 'cart-id',
        user: { id: mockUserId },
        items: [],
      };

      mockCartRepository.findOne.mockResolvedValue(existingCart);
      mockCartItemRepository.create.mockReturnValue({
        id: mockCartItemId,
        cart: existingCart,
        product: { id: mockProductId },
        quantity: 2,
        unitPrice: 100,
      });
      mockCartItemRepository.save.mockResolvedValue({
        id: mockCartItemId,
        cart: existingCart,
        product: { id: mockProductId },
        quantity: 2,
        unitPrice: 100,
      });

      await service.addItem(addItemDto, mockUserId);

      expect(mockCartItemRepository.create).toHaveBeenCalledWith({
        cart: existingCart,
        product: { id: mockProductId },
        quantity: 2,
        unitPrice: 100,
      });
      expect(mockCartItemRepository.save).toHaveBeenCalled();
    });

    it('should increment quantity if item already exists in cart', async () => {
      const addItemDto = { cartId: undefined, productId: mockProductId, quantity: 2, unitPrice: 100 };
      const existingItem = {
        id: mockCartItemId,
        product: { id: mockProductId },
        quantity: 3,
        unitPrice: 100,
      };
      const cartWithItem = {
        id: 'cart-id',
        user: { id: mockUserId },
        items: [existingItem],
      };

      mockCartRepository.findOne.mockResolvedValue(cartWithItem);
      mockCartItemRepository.save.mockResolvedValue({
        ...existingItem,
        quantity: 5,
      });

      await service.addItem(addItemDto, mockUserId);

      expect(existingItem.quantity).toBe(5);
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(existingItem);
    });
  });

  describe('updateItem', () => {
    it('should update the quantity of an item', async () => {
      const updateItemDto = { quantity: 5 };
      const existingItem = {
        id: mockCartItemId,
        cart: { user: { id: mockUserId } },
        quantity: 3,
      };

      mockCartItemRepository.findOne.mockResolvedValue(existingItem);
      mockCartItemRepository.save.mockResolvedValue({
        ...existingItem,
        quantity: 5,
      });

      await service.updateItem(mockCartItemId, updateItemDto, mockUserId);

      expect(mockCartItemRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCartItemId, cart: { user: { id: mockUserId } } },
        relations: ['cart', 'cart.user'],
      });
      expect(existingItem.quantity).toBe(5);
      expect(mockCartItemRepository.save).toHaveBeenCalledWith(existingItem);
    });

    it('should remove item when quantity is set to 0', async () => {
      const updateItemDto = { quantity: 0 };
      const existingItem = {
        id: mockCartItemId,
        cart: { user: { id: mockUserId } },
        quantity: 3,
      };

      mockCartItemRepository.findOne.mockResolvedValue(existingItem);
      mockCartItemRepository.remove.mockResolvedValue(existingItem);

      await service.updateItem(mockCartItemId, updateItemDto, mockUserId);

      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(existingItem);
    });

    it('should throw error if item not found', async () => {
      const updateItemDto = { quantity: 5 };

      mockCartItemRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateItem(mockCartItemId, updateItemDto, mockUserId),
      ).rejects.toThrow('item not found');
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
