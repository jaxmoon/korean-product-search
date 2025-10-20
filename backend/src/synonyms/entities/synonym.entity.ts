export class Synonym {
  id!: string;
  word!: string; // 대표 단어
  synonyms!: string[]; // 유의어 목록
  category?: string; // brand, product, general
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
