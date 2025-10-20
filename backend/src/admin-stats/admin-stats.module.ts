import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { ProductsModule } from '../products/products.module';
import { SynonymsModule } from '../synonyms/synonyms.module';

@Module({
  imports: [ElasticsearchModule, ProductsModule, SynonymsModule],
  controllers: [AdminStatsController],
})
export class AdminStatsModule {}
