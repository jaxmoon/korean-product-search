import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { SearchQueryDto } from '../common/dto/search-query.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockElasticsearchService: jest.Mocked<ElasticsearchService>;
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      index: jest.fn(),
      search: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockElasticsearchService = {
      getClient: jest.fn().mockReturnValue(mockClient),
      bulkIndex: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: '삼성 갤럭시 노트북',
        description: '최신 프리미엄 노트북',
        price: 1500000,
        category: '전자제품',
        brand: '삼성',
        stock: 10,
        tags: ['노트북', '삼성'],
        isActive: true,
      };

      mockClient.index.mockResolvedValue({
        _id: 'test-product-id',
      });

      const result = await service.create(createProductDto);

      expect(result.id).toBe('test-product-id');
      expect(result.name).toBe(createProductDto.name);
      expect(mockClient.index).toHaveBeenCalledWith({
        index: 'products',
        body: expect.objectContaining({
          ...createProductDto,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        refresh: 'true',
      });
    });

    it('should throw BadRequestException on failure', async () => {
      mockClient.index.mockRejectedValue(new Error('Index failed'));

      await expect(
        service.create({
          name: 'Test Product',
          price: 1000,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const productId = 'test-id';
      const mockProduct = {
        _id: productId,
        found: true,
        _source: {
          name: '삼성 갤럭시',
          price: 1000000,
          brand: '삼성',
        },
      };

      mockClient.get.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(result.id).toBe(productId);
      expect(result.name).toBe('삼성 갤럭시');
      expect(mockClient.get).toHaveBeenCalledWith({
        index: 'products',
        id: productId,
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockClient.get.mockResolvedValue({
        found: false,
      });

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search products with single word', async () => {
      const searchQuery: SearchQueryDto = {
        q: '노트북',
        page: 1,
        pageSize: 20,
      };

      mockClient.search.mockResolvedValue({
        hits: {
          total: { value: 5 },
          hits: [
            {
              _id: '1',
              _source: {
                name: 'LG 그램 노트북',
                price: 1500000,
                brand: 'LG',
              },
            },
            {
              _id: '2',
              _source: {
                name: '삼성 갤럭시 노트북',
                price: 2000000,
                brand: '삼성',
              },
            },
          ],
        },
      });

      const result = await service.search(searchQuery);

      expect(result.total).toBe(5);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('LG 그램 노트북');

      // Verify single-word search uses correct query structure
      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'products',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              must: expect.arrayContaining([
                expect.objectContaining({
                  multi_match: expect.objectContaining({
                    query: '노트북',
                    fields: ['name^3', 'brand^2', 'description'],
                  }),
                }),
              ]),
            }),
          }),
        }),
      });
    });

    it('should search products with multi-word AND logic', async () => {
      const searchQuery: SearchQueryDto = {
        q: '삼성 노트북',
        page: 1,
        pageSize: 20,
      };

      mockClient.search.mockResolvedValue({
        hits: {
          total: { value: 2 },
          hits: [
            {
              _id: '1',
              _source: {
                name: '삼성 갤럭시 노트북',
                price: 2000000,
                brand: '삼성',
              },
            },
          ],
        },
      });

      const result = await service.search(searchQuery);

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(1);

      // Verify multi-word search uses AND logic (bool + must)
      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'products',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              must: expect.arrayContaining([
                expect.objectContaining({
                  bool: expect.objectContaining({
                    must: expect.arrayContaining([
                      expect.objectContaining({
                        multi_match: expect.objectContaining({
                          query: '삼성',
                        }),
                      }),
                      expect.objectContaining({
                        multi_match: expect.objectContaining({
                          query: '노트북',
                        }),
                      }),
                    ]),
                  }),
                }),
              ]),
            }),
          }),
        }),
      });
    });

    it('should apply category filter', async () => {
      const searchQuery: SearchQueryDto = {
        q: '노트북',
        category: '전자제품',
        page: 1,
        pageSize: 20,
      };

      mockClient.search.mockResolvedValue({
        hits: {
          total: { value: 3 },
          hits: [],
        },
      });

      await service.search(searchQuery);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'products',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([{ term: { category: '전자제품' } }]),
            }),
          }),
        }),
      });
    });

    it('should apply price range filter', async () => {
      const searchQuery: SearchQueryDto = {
        q: '노트북',
        minPrice: 1000000,
        maxPrice: 2000000,
        page: 1,
        pageSize: 20,
      };

      mockClient.search.mockResolvedValue({
        hits: {
          total: { value: 2 },
          hits: [],
        },
      });

      await service.search(searchQuery);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'products',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                {
                  range: {
                    price: {
                      gte: 1000000,
                      lte: 2000000,
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should handle pagination correctly', async () => {
      const searchQuery: SearchQueryDto = {
        q: '노트북',
        page: 3,
        pageSize: 10,
      };

      mockClient.search.mockResolvedValue({
        hits: {
          total: { value: 50 },
          hits: [],
        },
      });

      await service.search(searchQuery);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'products',
        body: expect.objectContaining({
          from: 20, // (page - 1) * pageSize = (3 - 1) * 10
          size: 10,
        }),
      });
    });

    it('should throw BadRequestException on search failure', async () => {
      mockClient.search.mockRejectedValue(new Error('Search failed'));

      await expect(
        service.search({
          q: '노트북',
          page: 1,
          pageSize: 20,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const productId = 'test-id';
      const updateDto = {
        name: '업데이트된 상품명',
        price: 50000,
      };

      // Mock findOne (to check existence)
      mockClient.get.mockResolvedValue({
        _id: productId,
        found: true,
        _source: {
          name: '기존 상품명',
          price: 40000,
        },
      });

      // Mock update
      mockClient.update.mockResolvedValue({
        _id: productId,
      });

      const result = await service.update(productId, updateDto);

      expect(result.id).toBe(productId);
      expect(mockClient.update).toHaveBeenCalledWith({
        index: 'products',
        id: productId,
        body: {
          doc: expect.objectContaining({
            ...updateDto,
            updatedAt: expect.any(Date),
          }),
        },
        refresh: 'true',
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockClient.get.mockResolvedValue({
        found: false,
      });

      await expect(service.update('non-existent-id', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      const productId = 'test-id';

      // Mock findOne
      mockClient.get.mockResolvedValue({
        _id: productId,
        found: true,
        _source: {},
      });

      // Mock delete
      mockClient.delete.mockResolvedValue({
        _id: productId,
      });

      await service.remove(productId);

      expect(mockClient.delete).toHaveBeenCalledWith({
        index: 'products',
        id: productId,
        refresh: 'true',
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockClient.get.mockResolvedValue({
        found: false,
      });

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockClient.search.mockResolvedValue({
        hits: {
          total: { value: 100 },
          hits: Array(50).fill({
            _id: 'test-id',
            _source: {
              name: 'Test Product',
              price: 1000,
            },
          }),
        },
      });

      const result = await service.findAll(50, 0);

      expect(result.total).toBe(100);
      expect(result.items).toHaveLength(50);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
    });
  });
});
