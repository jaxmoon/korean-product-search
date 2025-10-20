import { Module } from '@nestjs/common';
import { AdminSynonymsController } from './admin-synonyms.controller';
import { SynonymsModule } from '../synonyms/synonyms.module';

@Module({
  imports: [SynonymsModule],
  controllers: [AdminSynonymsController],
})
export class AdminSynonymsModule {}
