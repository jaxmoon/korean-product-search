import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private readonly defaultIndexName = 'products';

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USERNAME', 'elastic'),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD', 'changeme'),
      },
    });
  }

  async onModuleInit() {
    const isConnected = await this.checkConnection();
    if (isConnected) {
      this.logger.log('Successfully connected to Elasticsearch');

      // 인덱스 자동 생성
      try {
        const indexExists = await this.ensureIndexExists(this.defaultIndexName);
        if (!indexExists) {
          await this.createProductsIndex(this.defaultIndexName);
          this.logger.log(`Index '${this.defaultIndexName}' created successfully`);
        } else {
          this.logger.log(`Index '${this.defaultIndexName}' already exists`);
        }
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Failed to initialize index: ${err.message}`, err.stack);
      }
    } else {
      this.logger.warn(
        'Failed to connect to Elasticsearch - service will continue with limited functionality',
      );
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const health = await this.client.cluster.health();
      this.logger.log(`Elasticsearch cluster health: ${health.status}`);
      return true;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to connect to Elasticsearch', err.stack);
      return false;
    }
  }

  async ensureIndexExists(indexName: string): Promise<boolean> {
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      return exists;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to check index existence: ${err.message}`, err.stack);
      return false;
    }
  }

  async createProductsIndex(indexName: string, synonyms: string[] = []): Promise<void> {
    try {
      // index-settings.json 파일 읽기 (환경 변수 또는 기본 경로 사용)
      const settingsPath = this.configService.get<string>(
        'ELASTICSEARCH_INDEX_SETTINGS_PATH',
        path.join(process.cwd(), '..', 'docker', 'elasticsearch', 'config', 'index-settings.json'),
      );

      this.logger.log(`Reading index settings from: ${settingsPath}`);

      if (!fs.existsSync(settingsPath)) {
        throw new Error(`Index settings file not found at: ${settingsPath}`);
      }

      const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
      const indexSettings = JSON.parse(settingsContent);

      // 제품명 사전 파일 읽기
      const productDictPath = this.configService.get<string>(
        'ELASTICSEARCH_PRODUCT_DICT_PATH',
        path.join(process.cwd(), '..', 'docker', 'elasticsearch', 'config', 'product-dictionary.txt'),
      );

      let productNames: string[] = [];
      if (fs.existsSync(productDictPath)) {
        const productDictContent = fs.readFileSync(productDictPath, 'utf-8');
        productNames = productDictContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#')); // 빈 줄과 주석 제거

        this.logger.log(`Loaded ${productNames.length} product names from dictionary`);
      } else {
        this.logger.warn(`Product dictionary not found at: ${productDictPath}`);
      }

      // User dictionary에 추가할 단어 수집
      const allWords: string[] = [...productNames]; // 제품명 사전으로 시작

      // synonym이 제공된 경우 설정에 추가
      if (synonyms.length > 0) {
        // synonym 규칙 추가
        indexSettings.settings.analysis.filter.synonym_filter.synonyms = synonyms;

        // 모든 synonym 단어를 user_dictionary에 추가하여 Nori tokenizer가 분해하지 않도록 함
        synonyms.forEach((rule) => {
          const words = rule.split(',').map(w => w.trim());
          allWords.push(...words);
        });

        this.logger.log(`Adding ${synonyms.length} synonyms to index settings`);
      }

      // 중복 제거 및 user dictionary 설정
      if (allWords.length > 0) {
        const uniqueWords = [...new Set(allWords)];
        indexSettings.settings.analysis.tokenizer.nori_tokenizer.user_dictionary_rules =
          uniqueWords;

        this.logger.log(`Total ${uniqueWords.length} words added to user dictionary (${productNames.length} products + synonyms)`);
        this.logger.debug(`User dictionary: ${JSON.stringify(uniqueWords)}`);
      }

      // 인덱스 생성
      await this.client.indices.create({
        index: indexName,
        body: indexSettings,
      });

      this.logger.log(`Index '${indexName}' created with custom settings`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create index '${indexName}': ${err.message}`, err.stack);
      throw err;
    }
  }

  async deleteIndex(indexName: string): Promise<void> {
    try {
      const exists = await this.ensureIndexExists(indexName);
      if (exists) {
        await this.client.indices.delete({ index: indexName });
        this.logger.log(`Index '${indexName}' deleted successfully`);
      } else {
        this.logger.warn(`Index '${indexName}' does not exist, nothing to delete`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete index '${indexName}': ${err.message}`, err.stack);
      throw err;
    }
  }

  async getIndexMapping(indexName: string) {
    try {
      const mapping = await this.client.indices.getMapping({ index: indexName });
      return mapping;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to get mapping for index '${indexName}': ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  async bulkIndex(indexName: string, documents: Record<string, unknown>[]): Promise<void> {
    try {
      if (!documents || documents.length === 0) {
        this.logger.warn('No documents to index');
        return;
      }

      const body = documents.flatMap((doc) => [{ index: { _index: indexName } }, doc]);

      const response = await this.client.bulk({ body, refresh: true });

      if (response.errors) {
        const erroredDocuments = response.items.filter((item) => item.index?.error);
        this.logger.error(`Bulk indexing had errors: ${erroredDocuments.length} documents failed`);
        erroredDocuments.forEach((item) => {
          this.logger.error(`Document error: ${JSON.stringify(item.index?.error)}`);
        });
      } else {
        this.logger.log(`Successfully indexed ${documents.length} documents to '${indexName}'`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to bulk index documents: ${err.message}`, err.stack);
      throw err;
    }
  }

  async getClusterHealth() {
    try {
      const health = await this.client.cluster.health();
      return health;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to get cluster health: ${err.message}`, err.stack);
      throw err;
    }
  }

  async getIndexStats(indexName: string) {
    try {
      const stats = await this.client.indices.stats({ index: indexName });
      return stats;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to get stats for index '${indexName}': ${err.message}`, err.stack);
      throw err;
    }
  }

  getClient(): Client {
    return this.client;
  }

  /**
   * 인덱스 설정 조회
   */
  async getIndexSettings(indexName: string): Promise<any> {
    try {
      const settings = await this.client.indices.getSettings({ index: indexName });
      return settings;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to get settings for index '${indexName}': ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * 인덱스 닫기 (설정 변경을 위해 필요)
   */
  async closeIndex(indexName: string): Promise<void> {
    try {
      await this.client.indices.close({ index: indexName });
      this.logger.log(`Index '${indexName}' closed successfully`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to close index '${indexName}': ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * 인덱스 열기
   */
  async openIndex(indexName: string): Promise<void> {
    try {
      await this.client.indices.open({ index: indexName });
      this.logger.log(`Index '${indexName}' opened successfully`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to open index '${indexName}': ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * 인덱스의 유의어 필터 업데이트
   * Reindex API를 사용하여 무중단으로 인덱스를 재생성합니다.
   *
   * 동작 방식:
   * 1. 새로운 synonym 설정으로 임시 인덱스 생성
   * 2. Reindex API로 전체 데이터 복사 (10,000개 제한 없음)
   * 3. Alias를 통한 무중단 전환
   * 4. 기존 인덱스 삭제 (옵션)
   *
   * @param indexName - 업데이트할 인덱스 이름
   * @param synonyms - 새로운 유의어 규칙 배열
   */
  async updateIndexSynonyms(indexName: string, synonyms: string[]): Promise<void> {
    const tempIndexName = `${indexName}_temp_${Date.now()}`;
    const aliasName = `${indexName}_active`;
    const startTime = Date.now();

    try {
      this.logger.log({
        message: 'Starting synonym update with reindex strategy',
        indexName,
        tempIndexName,
        synonymCount: synonyms.length,
      });

      // 1. 새로운 synonym 설정으로 임시 인덱스 생성
      this.logger.log(`Creating temporary index: ${tempIndexName}`);
      await this.createProductsIndex(tempIndexName, synonyms);

      // 2. 기존 인덱스 존재 여부 확인
      const sourceExists = await this.ensureIndexExists(indexName);

      if (sourceExists) {
        // 3. Reindex API로 전체 데이터 복사 (문서 개수 제한 없음)
        this.logger.log(`Reindexing data from ${indexName} to ${tempIndexName}...`);
        const reindexResponse = await this.client.reindex({
          body: {
            source: { index: indexName },
            dest: { index: tempIndexName },
          },
          wait_for_completion: true,
          refresh: true,
        });

        const copiedDocs = reindexResponse.total || 0;
        this.logger.log(`Reindexed ${copiedDocs} documents successfully`);

        // 4. Alias 전환을 통한 무중단 업데이트
        this.logger.log('Switching alias for zero-downtime update...');

        // 기존 alias 확인
        const aliasExists = await this.client.indices.existsAlias({
          name: aliasName,
        });

        if (aliasExists) {
          // 기존 alias 제거 후 새 인덱스에 추가
          await this.client.indices.updateAliases({
            body: {
              actions: [
                { remove: { index: indexName, alias: aliasName } },
                { add: { index: tempIndexName, alias: aliasName } },
              ],
            },
          });
        } else {
          // alias가 없으면 새로 생성
          await this.client.indices.putAlias({
            index: tempIndexName,
            name: aliasName,
          });
        }

        this.logger.log(`Alias '${aliasName}' switched to ${tempIndexName}`);

        // 5. 기존 인덱스 삭제
        this.logger.log(`Deleting old index: ${indexName}`);
        await this.deleteIndex(indexName);

        // 6. 임시 인덱스를 정식 이름으로 변경 (alias 제거 후)
        await this.client.indices.deleteAlias({
          index: tempIndexName,
          name: aliasName,
        });

        // Clone API를 사용하기 전에 인덱스를 read-only로 설정
        this.logger.log(`Setting ${tempIndexName} to read-only for cloning`);
        await this.client.indices.putSettings({
          index: tempIndexName,
          body: {
            settings: {
              'index.blocks.write': true,
            },
          },
        });

        // Clone API를 사용하여 이름 변경
        await this.client.indices.clone({
          index: tempIndexName,
          target: indexName,
          body: {
            settings: {
              'index.blocks.write': null, // write 블록 해제
            },
          },
        });

        // 임시 인덱스 삭제
        await this.deleteIndex(tempIndexName);

        this.logger.log(`Renamed ${tempIndexName} to ${indexName}`);
      } else {
        // 기존 인덱스가 없는 경우 임시 인덱스를 정식 이름으로 변경
        this.logger.warn(`Source index ${indexName} does not exist, creating new index`);

        // Clone API를 사용하기 전에 인덱스를 read-only로 설정
        this.logger.log(`Setting ${tempIndexName} to read-only for cloning`);
        await this.client.indices.putSettings({
          index: tempIndexName,
          body: {
            settings: {
              'index.blocks.write': true,
            },
          },
        });

        await this.client.indices.clone({
          index: tempIndexName,
          target: indexName,
          body: {
            settings: {
              'index.blocks.write': null, // write 블록 해제
            },
          },
        });
        await this.deleteIndex(tempIndexName);
      }

      const duration = Date.now() - startTime;
      this.logger.log({
        message: 'Synonym update completed successfully',
        indexName,
        synonymCount: synonyms.length,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error({
        message: 'Failed to update synonyms',
        indexName,
        tempIndexName,
        error: err.message,
        stack: err.stack,
      });

      // 실패 시 임시 인덱스 정리
      try {
        const tempExists = await this.ensureIndexExists(tempIndexName);
        if (tempExists) {
          this.logger.log(`Cleaning up temporary index: ${tempIndexName}`);
          await this.deleteIndex(tempIndexName);
        }
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup temporary index: ${cleanupError}`);
      }

      throw err;
    }
  }
}
