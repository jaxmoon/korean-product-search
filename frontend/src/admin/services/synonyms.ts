import { api } from './api';
import type {
  Synonym,
  CreateSynonymDto,
  UpdateSynonymDto,
  SyncResponse,
} from '../types/synonym';

/**
 * 유의어 관리 API 서비스
 */
export const synonymsService = {
  /**
   * 유의어 목록 조회
   */
  getAll: async (): Promise<Synonym[]> => {
    const response = await api.get<Synonym[]>('/admin/synonyms');
    return response.data;
  },

  /**
   * 특정 유의어 조회
   */
  getOne: async (id: string): Promise<Synonym> => {
    const response = await api.get<Synonym>(`/admin/synonyms/${id}`);
    return response.data;
  },

  /**
   * 유의어 생성
   */
  create: async (data: CreateSynonymDto): Promise<Synonym> => {
    const response = await api.post<Synonym>('/admin/synonyms', data);
    return response.data;
  },

  /**
   * 유의어 수정
   */
  update: async (id: string, data: UpdateSynonymDto): Promise<Synonym> => {
    const response = await api.put<Synonym>(`/admin/synonyms/${id}`, data);
    return response.data;
  },

  /**
   * 유의어 삭제
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/synonyms/${id}`);
  },

  /**
   * Elasticsearch 동기화
   */
  syncToElasticsearch: async (): Promise<SyncResponse> => {
    const response = await api.post<SyncResponse>('/admin/synonyms/sync');
    return response.data;
  },
};
