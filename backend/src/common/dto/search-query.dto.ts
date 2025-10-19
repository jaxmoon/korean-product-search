import { IsString, IsOptional, IsNumber, Min, Max, IsArray, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for product search queries with filters, sorting, and pagination
 */
export class SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Search query string for product name and description',
    example: 'wireless headphones',
  })
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  q?: string;

  @ApiPropertyOptional({
    description: 'Category filter',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @ApiPropertyOptional({
    description: 'Brand filter',
    example: 'Sony',
  })
  @IsOptional()
  @IsString({ message: 'Brand must be a string' })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter in KRW',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum price must be a number' })
  @Min(0, { message: 'Minimum price must be at least 0' })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter in KRW',
    example: 200000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum price must be a number' })
  @Min(0, { message: 'Maximum price must be at least 0' })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Product tags for filtering (comma-separated)',
    example: 'wireless,bluetooth,noise-cancellation',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag) => tag.trim());
    }
    return value;
  })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Sort order for results',
    example: 'price:asc',
    enum: ['price:asc', 'price:desc', 'rating:desc', 'createdAt:desc', 'name:asc', 'name:desc'],
    default: 'createdAt:desc',
  })
  @IsOptional()
  @IsString({ message: 'Sort parameter must be a string' })
  @IsIn(['price:asc', 'price:desc', 'rating:desc', 'createdAt:desc', 'name:asc', 'name:desc'], {
    message:
      'Sort must be one of: price:asc, price:desc, rating:desc, createdAt:desc, name:asc, name:desc',
  })
  sort?: string = 'createdAt:desc';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page number must be a number' })
  @Min(1, { message: 'Page number must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page size must be a number' })
  @Min(1, { message: 'Page size must be at least 1' })
  @Max(100, { message: 'Page size must not exceed 100' })
  pageSize?: number = 10;
}
