import { useQuery, useMutation } from '@tanstack/react-query';
import { indexesService } from '../services/indexes';
import type { ReindexDto } from '../types/elasticsearch-index';

/**
 * xq¤ µÄ pŒ Å
 */
export const useIndexStats = (indexName: string) => {
  return useQuery({
    queryKey: ['indexStats', indexName],
    queryFn: () => indexesService.getStats(indexName),
    enabled: !!indexName,
  });
};

/**
 * xq¤ ¬Ý1 ¤LtX Å
 */
export const useRecreateIndex = () => {
  return useMutation({
    mutationFn: (indexName: string) => indexesService.recreate(indexName),
  });
};

/**
 * xq¤ ­ ¤LtX Å
 */
export const useDeleteIndex = () => {
  return useMutation({
    mutationFn: (indexName: string) => indexesService.delete(indexName),
  });
};

/**
 * ¬xqñ ¤LtX Å
 */
export const useReindex = () => {
  return useMutation({
    mutationFn: (data: ReindexDto) => indexesService.reindex(data),
  });
};
