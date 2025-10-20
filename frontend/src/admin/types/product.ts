/**
 * 상품 인터페이스
 */
export interface Product extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand?: string;
  images?: string[];
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 상품 목록 응답
 */
export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 상품 생성 DTO
 */
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand?: string;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
}

/**
 * 상품 수정 DTO
 */
export interface UpdateProductDto extends Partial<CreateProductDto> {}

/**
 * 상품 조회 파라미터
 */
export interface ProductQueryParams {
  limit?: number;
  offset?: number;
}
