import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/products';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from '../types/product';

/**
 * 상품 목록 조회 훅
 */
export const useProducts = (params: ProductQueryParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getAll(params),
  });
};

/**
 * 특정 상품 조회 훅
 */
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getOne(id),
    enabled: !!id,
  });
};

/**
 * 상품 생성 뮤테이션 훅
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsService.create(data),
    onSuccess: () => {
      // 상품 목록 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * 상품 수정 뮤테이션 훅
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsService.update(id, data),
    onSuccess: (_, variables) => {
      // 특정 상품과 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * 상품 삭제 뮤테이션 훅
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      // 상품 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
