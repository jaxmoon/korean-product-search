import { api } from './api';
import {
  Product,
  ProductListResponse,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
} from '../types/product';

/**
 * 상품 관리 API 서비스
 */
export const productsService = {
  /**
   * 상품 목록 조회
   */
  getAll: async (params: ProductQueryParams = {}): Promise<ProductListResponse> => {
    const { limit = 50, offset = 0 } = params;
    const response = await api.get<ProductListResponse>('/admin/products', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * 특정 상품 조회
   */
  getOne: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * 상품 생성
   */
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post<Product>('/admin/products', data);
    return response.data;
  },

  /**
   * 상품 수정
   */
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await api.put<Product>(`/admin/products/${id}`, data);
    return response.data;
  },

  /**
   * 상품 삭제
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },
};
