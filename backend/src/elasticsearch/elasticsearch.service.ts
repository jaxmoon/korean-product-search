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

  async createProductsIndex(indexName: string): Promise<void> {
    try {
      // index-settings.json 파일 읽기
      const settingsPath = path.join(
        process.cwd(),
        '..',
        'docker',
        'elasticsearch',
        'config',
        'index-settings.json',
      );

      this.logger.log(`Reading index settings from: ${settingsPath}`);

      if (!fs.existsSync(settingsPath)) {
        throw new Error(`Index settings file not found at: ${settingsPath}`);
      }

      const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
      const indexSettings = JSON.parse(settingsContent);

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

  async getIndexMapping(indexName: string): Promise<Record<string, unknown>> {
    try {
      const mapping = await this.client.indices.getMapping({ index: indexName });
      return mapping as Record<string, unknown>;
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

  async getClusterHealth(): Promise<Record<string, unknown>> {
    try {
      const health = await this.client.cluster.health();
      return health as Record<string, unknown>;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to get cluster health: ${err.message}`, err.stack);
      throw err;
    }
  }

  async getIndexStats(indexName: string): Promise<Record<string, unknown>> {
    try {
      const stats = await this.client.indices.stats({ index: indexName });
      return stats as Record<string, unknown>;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to get stats for index '${indexName}': ${err.message}`, err.stack);
      throw err;
    }
  }

  getClient(): Client {
    return this.client;
  }
}
