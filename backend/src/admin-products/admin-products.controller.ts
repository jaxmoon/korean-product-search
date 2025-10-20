import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';

@ApiTags('Admin Products')
@Controller('admin/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '상품 생성 (관리자 전용)' })
  @ApiResponse({ status: 201, description: '상품이 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 상품 조회 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '상품 목록을 반환합니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  findAll(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.productsService.findAll(limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 상품 조회 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '상품 정보를 반환합니다.' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '상품 수정 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '상품이 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '상품 삭제 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '상품이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: '샘플 데이터 생성 (관리자 전용)' })
  @ApiResponse({ status: 201, description: '샘플 데이터가 생성되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  seed(@Query('count') count?: number) {
    return this.productsService.seed(count || 1000);
  }
}
