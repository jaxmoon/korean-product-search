/**
 * xq� �� �
 */
export interface IndexStats {
  indexName: string;
  stats: {
    total?: {
      docs?: {
        count: number;
        deleted: number;
      };
      store?: {
        size_in_bytes: number;
      };
    };
  };
  settings: Record<string, unknown>;
  mappings: Record<string, unknown>;
}

/**
 * xq� ��1 Q�
 */
export interface RecreateIndexResponse {
  message: string;
}

/**
 * xq� � Q�
 */
export interface DeleteIndexResponse {
  message: string;
}

/**
 * �xq� �� DTO
 */
export interface ReindexDto {
  sourceIndex: string;
  destIndex: string;
  synonyms?: string[];
}

/**
 * �xq� Q�
 */
export interface ReindexResponse {
  message: string;
  total?: number;
  created?: number;
  updated?: number;
}
