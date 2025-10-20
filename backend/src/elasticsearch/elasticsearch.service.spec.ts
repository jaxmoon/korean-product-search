import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from './elasticsearch.service';
import { Client } from '@elastic/elasticsearch';

// Mock Elasticsearch Client
jest.mock('@elastic/elasticsearch', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      cluster: {
        health: jest.fn(),
      },
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        getMapping: jest.fn(),
        getSettings: jest.fn(),
        close: jest.fn(),
        open: jest.fn(),
        existsAlias: jest.fn(),
        updateAliases: jest.fn(),
        putAlias: jest.fn(),
        deleteAlias: jest.fn(),
        clone: jest.fn(),
      },
      search: jest.fn(),
      bulk: jest.fn(),
      reindex: jest.fn(),
    })),
  };
});

describe('ElasticsearchService', () => {
  let service: ElasticsearchService;
  let mockClient: jest.Mocked<Client>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config = {
          ELASTICSEARCH_NODE: 'http://localhost:9200',
          ELASTICSEARCH_USERNAME: 'elastic',
          ELASTICSEARCH_PASSWORD: 'test_password',
        };
        return config[key] || defaultValue;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ElasticsearchService>(ElasticsearchService);
    mockClient = service.getClient() as jest.Mocked<Client>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkConnection', () => {
    it('should return true when Elasticsearch is healthy', async () => {
      mockClient.cluster.health.mockResolvedValue({
        status: 'green',
      } as any);

      const result = await service.checkConnection();

      expect(result).toBe(true);
      expect(mockClient.cluster.health).toHaveBeenCalled();
    });

    it('should return false when connection fails', async () => {
      mockClient.cluster.health.mockRejectedValue(new Error('Connection failed'));

      const result = await service.checkConnection();

      expect(result).toBe(false);
    });
  });

  describe('ensureIndexExists', () => {
    it('should return true when index exists', async () => {
      mockClient.indices.exists.mockResolvedValue(true as any);

      const result = await service.ensureIndexExists('test-index');

      expect(result).toBe(true);
      expect(mockClient.indices.exists).toHaveBeenCalledWith({ index: 'test-index' });
    });

    it('should return false when index does not exist', async () => {
      mockClient.indices.exists.mockResolvedValue(false as any);

      const result = await service.ensureIndexExists('test-index');

      expect(result).toBe(false);
    });

    it('should return false when check fails', async () => {
      mockClient.indices.exists.mockRejectedValue(new Error('Check failed'));

      const result = await service.ensureIndexExists('test-index');

      expect(result).toBe(false);
    });
  });

  describe('deleteIndex', () => {
    it('should delete index when it exists', async () => {
      mockClient.indices.exists.mockResolvedValue(true as any);
      mockClient.indices.delete.mockResolvedValue({ acknowledged: true } as any);

      await service.deleteIndex('test-index');

      expect(mockClient.indices.delete).toHaveBeenCalledWith({ index: 'test-index' });
    });

    it('should not delete when index does not exist', async () => {
      mockClient.indices.exists.mockResolvedValue(false as any);

      await service.deleteIndex('test-index');

      expect(mockClient.indices.delete).not.toHaveBeenCalled();
    });
  });

  describe('bulkIndex', () => {
    it('should successfully index documents', async () => {
      const documents = [
        { name: 'Product 1', price: 1000 },
        { name: 'Product 2', price: 2000 },
      ];

      mockClient.bulk.mockResolvedValue({
        errors: false,
        items: [{ index: { _id: '1', status: 201 } }, { index: { _id: '2', status: 201 } }],
      } as any);

      await service.bulkIndex('test-index', documents);

      expect(mockClient.bulk).toHaveBeenCalledWith({
        body: expect.arrayContaining([
          { index: { _index: 'test-index' } },
          documents[0],
          { index: { _index: 'test-index' } },
          documents[1],
        ]),
        refresh: true,
      });
    });

    it('should handle empty document array', async () => {
      await service.bulkIndex('test-index', []);

      expect(mockClient.bulk).not.toHaveBeenCalled();
    });

    it('should log errors for failed documents', async () => {
      const documents = [{ name: 'Product 1' }];

      mockClient.bulk.mockResolvedValue({
        errors: true,
        items: [
          {
            index: {
              _id: '1',
              status: 400,
              error: { type: 'mapper_parsing_exception', reason: 'failed to parse' },
            },
          },
        ],
      } as any);

      await service.bulkIndex('test-index', documents);

      expect(mockClient.bulk).toHaveBeenCalled();
    });
  });

  describe('updateIndexSynonyms', () => {
    const indexName = 'products';
    const synonyms = ['스타벅스,스벅,스타박스', 'LG,엘지'];

    beforeEach(() => {
      // Mock file system for createProductsIndex
      jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
      jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(
        JSON.stringify({
          settings: {
            analysis: {
              tokenizer: {
                nori_tokenizer: {
                  user_dictionary_rules: [],
                },
              },
              filter: {
                synonym_filter: {
                  synonyms: [],
                },
              },
            },
          },
          mappings: {},
        }),
      );
    });

    it('should use reindex API for zero-downtime update', async () => {
      // Mock index exists
      mockClient.indices.exists
        .mockResolvedValueOnce(false as any) // temp index doesn't exist
        .mockResolvedValueOnce(true as any); // source index exists

      // Mock successful reindex
      mockClient.reindex.mockResolvedValue({
        total: 1000,
        updated: 0,
        created: 1000,
      } as any);

      // Mock alias operations
      mockClient.indices.existsAlias.mockResolvedValue(false as any);
      mockClient.indices.putAlias.mockResolvedValue({ acknowledged: true } as any);
      mockClient.indices.deleteAlias.mockResolvedValue({ acknowledged: true } as any);

      // Mock clone operation
      mockClient.indices.clone.mockResolvedValue({ acknowledged: true } as any);

      // Mock delete operations
      mockClient.indices.delete.mockResolvedValue({ acknowledged: true } as any);

      await service.updateIndexSynonyms(indexName, synonyms);

      // Verify reindex was called
      expect(mockClient.reindex).toHaveBeenCalledWith({
        body: {
          source: { index: indexName },
          dest: { index: expect.stringContaining('products_temp_') },
        },
        wait_for_completion: true,
        refresh: true,
      });

      // Verify alias operations
      expect(mockClient.indices.putAlias).toHaveBeenCalled();

      // Verify index was cloned back to original name
      expect(mockClient.indices.clone).toHaveBeenCalledWith({
        index: expect.stringContaining('products_temp_'),
        target: indexName,
      });
    });

    it('should cleanup temporary index on failure', async () => {
      // Mock index exists
      mockClient.indices.exists
        .mockResolvedValueOnce(false as any) // temp index check
        .mockResolvedValueOnce(true as any) // source exists
        .mockResolvedValueOnce(true as any); // temp exists for cleanup

      // Mock reindex failure
      mockClient.reindex.mockRejectedValue(new Error('Reindex failed'));

      // Mock cleanup
      mockClient.indices.delete.mockResolvedValue({ acknowledged: true } as any);

      await expect(service.updateIndexSynonyms(indexName, synonyms)).rejects.toThrow(
        'Reindex failed',
      );

      // Verify cleanup was attempted
      expect(mockClient.indices.delete).toHaveBeenCalledWith({
        index: expect.stringContaining('products_temp_'),
      });
    });

    it('should create new index when source does not exist', async () => {
      // Mock index doesn't exist
      mockClient.indices.exists
        .mockResolvedValueOnce(false as any) // temp index check
        .mockResolvedValueOnce(false as any); // source doesn't exist

      // Mock clone operation
      mockClient.indices.clone.mockResolvedValue({ acknowledged: true } as any);
      mockClient.indices.delete.mockResolvedValue({ acknowledged: true } as any);

      await service.updateIndexSynonyms(indexName, synonyms);

      // Should not call reindex since source doesn't exist
      expect(mockClient.reindex).not.toHaveBeenCalled();

      // Should clone temp index to target name
      expect(mockClient.indices.clone).toHaveBeenCalledWith({
        index: expect.stringContaining('products_temp_'),
        target: indexName,
      });
    });
  });

  describe('getClusterHealth', () => {
    it('should return cluster health status', async () => {
      const healthStatus = {
        cluster_name: 'test-cluster',
        status: 'green',
        number_of_nodes: 1,
      };

      mockClient.cluster.health.mockResolvedValue(healthStatus as any);

      const result = await service.getClusterHealth();

      expect(result).toEqual(healthStatus);
    });

    it('should throw error when health check fails', async () => {
      mockClient.cluster.health.mockRejectedValue(new Error('Health check failed'));

      await expect(service.getClusterHealth()).rejects.toThrow('Health check failed');
    });
  });
});
