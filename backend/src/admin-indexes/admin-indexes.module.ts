import { Module } from '@nestjs/common';
import { AdminIndexesController } from './admin-indexes.controller';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [ElasticsearchModule],
  controllers: [AdminIndexesController],
})
export class AdminIndexesModule {}
