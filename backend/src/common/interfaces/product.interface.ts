export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images?: string[];
  stock: number;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult<T> {
  total: number;
  items: T[];
  page: number;
  pageSize: number;
}
