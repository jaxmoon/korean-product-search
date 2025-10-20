import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { synonymsService } from '../services/synonyms';
import type { CreateSynonymDto, UpdateSynonymDto } from '../types/synonym';

/**
 * 유의어 목록 조회 훅
 */
export const useSynonyms = () => {
  return useQuery({
    queryKey: ['synonyms'],
    queryFn: synonymsService.getAll,
  });
};

/**
 * 특정 유의어 조회 훅
 */
export const useSynonym = (id: string) => {
  return useQuery({
    queryKey: ['synonyms', id],
    queryFn: () => synonymsService.getOne(id),
    enabled: !!id,
  });
};

/**
 * 유의어 생성 뮤테이션 훅
 */
export const useCreateSynonym = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSynonymDto) => synonymsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synonyms'] });
    },
  });
};

/**
 * 유의어 수정 뮤테이션 훅
 */
export const useUpdateSynonym = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSynonymDto }) =>
      synonymsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['synonyms', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['synonyms'] });
    },
  });
};

/**
 * 유의어 삭제 뮤테이션 훅
 */
export const useDeleteSynonym = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => synonymsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synonyms'] });
    },
  });
};

/**
 * Elasticsearch 동기화 뮤테이션 훅
 */
export const useSyncSynonyms = () => {
  return useMutation({
    mutationFn: synonymsService.syncToElasticsearch,
  });
};
