import { Module } from '@nestjs/common';
import { SynonymsController } from './synonyms.controller';
import { SynonymsService } from './synonyms.service';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [ElasticsearchModule],
  controllers: [SynonymsController],
  providers: [SynonymsService],
  exports: [SynonymsService],
})
export class SynonymsModule {}
