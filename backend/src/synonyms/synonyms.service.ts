import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { CreateSynonymDto } from './dto/create-synonym.dto';
import { UpdateSynonymDto } from './dto/update-synonym.dto';
import { SynonymResponseDto } from './dto/synonym-response.dto';
import { Synonym } from './entities/synonym.entity';
import { INITIAL_SYNONYMS } from './data/initial-synonyms';

@Injectable()
export class SynonymsService implements OnModuleInit {
  private readonly logger = new Logger(SynonymsService.name);
  private readonly indexName = 'synonyms';
  private readonly productIndexName = 'products';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async onModuleInit() {
    try {
      // 유의어 인덱스 생성
      const exists = await this.elasticsearchService.ensureIndexExists(this.indexName);

      if (!exists) {
        await this.createSynonymsIndex();
        this.logger.log(`Synonyms index '${this.indexName}' created`);

        // 초기 유의어 데이터 로드
        await this.loadInitialSynonyms();
      } else {
        this.logger.log(`Synonyms index '${this.indexName}' already exists`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to initialize synonyms: ${err.message}`, err.stack);
    }
  }

  /**
   * 유의어 전용 인덱스 생성
   */
  private async createSynonymsIndex(): Promise<void> {
    const client = this.elasticsearchService.getClient();

    await client.indices.create({
      index: this.indexName,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
        mappings: {
          properties: {
            word: { type: 'keyword' },
            synonyms: { type: 'keyword' },
            category: { type: 'keyword' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      },
    });
  }

  /**
   * 초기 유의어 데이터 로드
   */
  private async loadInitialSynonyms(): Promise<void> {
    try {
      for (const synonymDto of INITIAL_SYNONYMS) {
        await this.create(synonymDto);
      }

      // Elasticsearch 제품 인덱스에 유의어 동기화
      await this.syncToElasticsearch();

      this.logger.log(`Loaded ${INITIAL_SYNONYMS.length} initial synonyms`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to load initial synonyms: ${err.message}`, err.stack);
    }
  }

  /**
   * 유의어 생성
   */
  async create(createSynonymDto: CreateSynonymDto): Promise<SynonymResponseDto> {
    try {
      const client = this.elasticsearchService.getClient();
      const now = new Date();

      const synonym: Omit<Synonym, 'id'> = {
        word: createSynonymDto.word,
        synonyms: createSynonymDto.synonyms,
        category: createSynonymDto.category,
        isActive: createSynonymDto.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      };

      const response = await client.index({
        index: this.indexName,
        body: synonym,
        refresh: 'true',
      });

      this.logger.log(`Synonym created: ${createSynonymDto.word} (ID: ${response._id})`);

      return SynonymResponseDto.fromEntity({
        id: response._id,
        ...synonym,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create synonym: ${err.message}`, err.stack);
      throw new BadRequestException('유의어 생성에 실패했습니다.');
    }
  }

  /**
   * 모든 유의어 조회
   */
  async findAll(): Promise<SynonymResponseDto[]> {
    try {
      const client = this.elasticsearchService.getClient();

      const response = await client.search({
        index: this.indexName,
        body: {
          size: 1000,
          query: { match_all: {} },
          sort: [{ createdAt: { order: 'desc' } }],
        },
      });

      const hits = response.hits.hits;

      return hits.map((hit) =>
        SynonymResponseDto.fromEntity({
          id: hit._id as string,
          ...(hit._source as Omit<Synonym, 'id'>),
        }),
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to fetch synonyms: ${err.message}`, err.stack);
      throw new BadRequestException('유의어 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 특정 유의어 조회
   */
  async findOne(id: string): Promise<SynonymResponseDto> {
    try {
      const client = this.elasticsearchService.getClient();

      const response = await client.get({
        index: this.indexName,
        id,
      });

      if (!response.found) {
        throw new NotFoundException(`ID ${id}인 유의어를 찾을 수 없습니다.`);
      }

      return SynonymResponseDto.fromEntity({
        id: response._id,
        ...(response._source as Omit<Synonym, 'id'>),
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Failed to fetch synonym ${id}: ${err.message}`, err.stack);
      throw new BadRequestException('유의어 조회에 실패했습니다.');
    }
  }

  /**
   * 유의어 수정
   */
  async update(id: string, updateSynonymDto: UpdateSynonymDto): Promise<SynonymResponseDto> {
    try {
      const client = this.elasticsearchService.getClient();

      // 먼저 유의어가 존재하는지 확인
      await this.findOne(id);

      const updateData = {
        ...updateSynonymDto,
        updatedAt: new Date(),
      };

      await client.update({
        index: this.indexName,
        id,
        body: {
          doc: updateData,
        },
        refresh: 'true',
      });

      this.logger.log(`Synonym ${id} updated successfully`);

      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Failed to update synonym ${id}: ${err.message}`, err.stack);
      throw new BadRequestException('유의어 수정에 실패했습니다.');
    }
  }

  /**
   * 유의어 삭제
   */
  async remove(id: string): Promise<void> {
    try {
      const client = this.elasticsearchService.getClient();

      // 먼저 유의어가 존재하는지 확인
      await this.findOne(id);

      await client.delete({
        index: this.indexName,
        id,
        refresh: 'true',
      });

      this.logger.log(`Synonym ${id} deleted successfully`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Failed to delete synonym ${id}: ${err.message}`, err.stack);
      throw new BadRequestException('유의어 삭제에 실패했습니다.');
    }
  }

  /**
   * 대량 유의어 추가
   */
  async bulkCreate(
    createSynonymDtos: CreateSynonymDto[],
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const dto of createSynonymDtos) {
      try {
        await this.create(dto);
        success++;
      } catch {
        failed++;
        this.logger.error(`Failed to create synonym: ${dto.word}`);
      }
    }

    return { success, failed };
  }

  /**
   * Elasticsearch 제품 인덱스에 유의어 동기화
   */
  async syncToElasticsearch(): Promise<{ message: string; count: number }> {
    try {
      // 모든 활성화된 유의어 조회
      const allSynonyms = await this.findAll();
      const activeSynonyms = allSynonyms.filter((s) => s.isActive);

      // Elasticsearch synonym 형식으로 변환
      // 형식: "단어1,단어2,단어3" (comma-separated, 공백 없음)
      const synonymRules = activeSynonyms.map((synonym) => {
        // 대표 단어를 포함한 전체 유의어 목록
        const allWords = Array.from(new Set([synonym.word, ...synonym.synonyms]));
        return allWords.join(',');
      });

      this.logger.log(`Syncing ${synonymRules.length} synonym rules to Elasticsearch...`);

      // 제품 인덱스에 유의어 필터 업데이트
      await this.elasticsearchService.updateIndexSynonyms(this.productIndexName, synonymRules);

      this.logger.log(`Successfully synced ${synonymRules.length} synonyms to Elasticsearch`);

      return {
        message: `${synonymRules.length}개의 유의어가 Elasticsearch에 동기화되었습니다.`,
        count: synonymRules.length,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to sync synonyms to Elasticsearch: ${err.message}`, err.stack);
      throw new BadRequestException('유의어 동기화에 실패했습니다.');
    }
  }
}
