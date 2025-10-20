/**
 * xq¤ µÄ ô
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
 * xq¤ ¬Ý1 Qõ
 */
export interface RecreateIndexResponse {
  message: string;
}

/**
 * xq¤ ­ Qõ
 */
export interface DeleteIndexResponse {
  message: string;
}

/**
 * ¬xqñ ”­ DTO
 */
export interface ReindexDto {
  sourceIndex: string;
  destIndex: string;
  synonyms?: string[];
}

/**
 * ¬xqñ Qõ
 */
export interface ReindexResponse {
  message: string;
  total?: number;
  created?: number;
  updated?: number;
}
