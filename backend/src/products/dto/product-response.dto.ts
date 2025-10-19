import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Product interface for type safety
 */
export interface Product {
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
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for product API responses
 * Includes search highlighting information
 */
export class ProductResponseDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Premium Wireless Headphones',
  })
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
  })
  description!: string;

  @ApiProperty({
    description: 'Product price in KRW',
    example: 129000,
  })
  price!: number;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
  })
  category!: string;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 50,
  })
  stock!: number;

  @ApiPropertyOptional({
    description: 'Product brand',
    example: 'Sony',
  })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Product image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Product tags',
    example: ['wireless', 'noise-cancellation', 'bluetooth'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Product rating (0-5)',
    example: 4.5,
  })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Number of reviews',
    example: 128,
  })
  reviewCount?: number;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Product last update timestamp',
    example: '2024-01-15T12:30:00.000Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Search relevance score',
    example: 0.95,
  })
  score?: number;

  @ApiPropertyOptional({
    description: 'Highlighted fields from search (HTML with <em> tags)',
    example: {
      name: ['Premium <em>Wireless</em> Headphones'],
      description: ['High-quality <em>wireless</em> headphones'],
    },
  })
  highlight?: Record<string, string[]>;
}

/**
 * DTO for paginated product list responses
 */
export class ProductListResponseDto {
  @ApiProperty({
    description: 'List of products',
    type: [ProductResponseDto],
  })
  products!: ProductResponseDto[];

  @ApiProperty({
    description: 'Total number of products matching the query',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  pageSize!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages!: number;

  @ApiPropertyOptional({
    description: 'Search query used',
    example: 'wireless headphones',
  })
  query?: string;

  @ApiPropertyOptional({
    description: 'Applied filters',
    example: {
      category: 'Electronics',
      minPrice: 50000,
      maxPrice: 200000,
    },
  })
  filters?: Record<string, string | number | string[]>;

  @ApiPropertyOptional({
    description: 'Sort order applied',
    example: 'price:asc',
  })
  sort?: string;
}
