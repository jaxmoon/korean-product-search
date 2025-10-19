import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;

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
      this.logger.error('Failed to connect to Elasticsearch', error);
      return false;
    }
  }

  getClient(): Client {
    return this.client;
  }
}
