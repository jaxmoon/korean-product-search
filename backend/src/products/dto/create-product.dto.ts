import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Wireless Headphones',
    minLength: 1,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  @MinLength(1, { message: 'Product name must be at least 1 character long' })
  @MaxLength(200, { message: 'Product name must not exceed 200 characters' })
  name!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
    minLength: 1,
    maxLength: 2000,
  })
  @IsNotEmpty({ message: 'Product description is required' })
  @IsString({ message: 'Product description must be a string' })
  @MinLength(1, {
    message: 'Product description must be at least 1 character long',
  })
  @MaxLength(2000, {
    message: 'Product description must not exceed 2000 characters',
  })
  description!: string;

  @ApiProperty({
    description: 'Product price in KRW',
    example: 129000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Product price is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Product price must be a number' })
  @Min(0, { message: 'Product price must be at least 0' })
  price!: number;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
  })
  @IsNotEmpty({ message: 'Product category is required' })
  @IsString({ message: 'Product category must be a string' })
  category!: string;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 50,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Stock quantity is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Stock quantity must be a number' })
  @Min(0, { message: 'Stock quantity must be at least 0' })
  stock!: number;

  @ApiPropertyOptional({
    description: 'Product brand',
    example: 'Sony',
  })
  @IsOptional()
  @IsString({ message: 'Product brand must be a string' })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Product image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Product images must be an array' })
  @IsString({ each: true, message: 'Each image must be a string URL' })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Product tags for search and categorization',
    example: ['wireless', 'noise-cancellation', 'bluetooth'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Product tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Product rating (0-5)',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Product rating must be a number' })
  @Min(0, { message: 'Product rating must be at least 0' })
  @Max(5, { message: 'Product rating must not exceed 5' })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Number of reviews',
    example: 128,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Review count must be a number' })
  @Min(0, { message: 'Review count must be at least 0' })
  reviewCount?: number;

  @ApiPropertyOptional({
    description: 'Whether the product is active and available for sale',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
