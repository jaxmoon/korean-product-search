import { useQuery, useMutation } from '@tanstack/react-query';
import { indexesService } from '../services/indexes';
import type { ReindexDto } from '../types/elasticsearch-index';

/**
 * xq� �� p� �
 */
export const useIndexStats = (indexName: string) => {
  return useQuery({
    queryKey: ['indexStats', indexName],
    queryFn: () => indexesService.getStats(indexName),
    enabled: !!indexName,
  });
};

/**
 * xq� ��1 �LtX �
 */
export const useRecreateIndex = () => {
  return useMutation({
    mutationFn: (indexName: string) => indexesService.recreate(indexName),
  });
};

/**
 * xq� � �LtX �
 */
export const useDeleteIndex = () => {
  return useMutation({
    mutationFn: (indexName: string) => indexesService.delete(indexName),
  });
};

/**
 * �xq� �LtX �
 */
export const useReindex = () => {
  return useMutation({
    mutationFn: (data: ReindexDto) => indexesService.reindex(data),
  });
};
