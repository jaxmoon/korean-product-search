export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  imageUrl?: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult<T> {
  total: number;
  items: T[];
  page: number;
  pageSize: number;
}
