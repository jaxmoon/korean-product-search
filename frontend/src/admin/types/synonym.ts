/**
 * 유의어 인터페이스
 */
export interface Synonym extends Record<string, unknown> {
  id: string;
  word: string;
  synonyms: string[];
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 유의어 생성 DTO
 */
export interface CreateSynonymDto {
  word: string;
  synonyms: string[];
  category?: string;
  isActive?: boolean;
}

/**
 * 유의어 수정 DTO
 */
export interface UpdateSynonymDto extends Partial<CreateSynonymDto> {}

/**
 * Elasticsearch 동기화 응답
 */
export interface SyncResponse {
  success: boolean;
  message: string;
  syncedCount?: number;
}
