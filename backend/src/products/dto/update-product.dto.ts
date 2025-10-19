import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating an existing product
 * All fields from CreateProductDto are optional
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Premium Wireless Headphones',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Product price in KRW',
    example: 129000,
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'Electronics',
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'Available stock quantity',
    example: 50,
  })
  stock?: number;

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
    description: 'Product tags for search and categorization',
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
    description: 'Whether the product is active and available for sale',
    example: true,
  })
  isActive?: boolean;
}
