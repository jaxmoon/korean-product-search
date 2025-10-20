// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

// Synonym Types
export interface Synonym {
  id: string;
  term: string;
  synonyms: string[];
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  products: {
    total: number;
  };
  synonyms: {
    total: number;
    active: number;
    inactive: number;
  };
  elasticsearch: {
    status: string;
    numberOfNodes: number;
    numberOfDataNodes: number;
    activePrimaryShards: number;
    activeShards: number;
  };
}

// Index Types
export interface IndexStats {
  indexName: string;
  stats: Record<string, unknown>;
  settings: Record<string, unknown>;
  mappings: Record<string, unknown>;
}
