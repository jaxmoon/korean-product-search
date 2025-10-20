import { Synonym } from '../entities/synonym.entity';

export class SynonymResponseDto {
  id!: string;
  word!: string;
  synonyms!: string[];
  category?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: Synonym): SynonymResponseDto {
    return {
      id: entity.id,
      word: entity.word,
      synonyms: entity.synonyms,
      category: entity.category,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
