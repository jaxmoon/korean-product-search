import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchQueryDto } from '../common/dto/search-query.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: '상품 생성', description: '새로운 상품을 생성합니다.' })
  @ApiResponse({
    status: 201,
    description: '상품이 성공적으로 생성되었습니다.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiBody({ type: CreateProductDto })
  async create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: '모든 상품 조회',
    description: '등록된 모든 상품을 페이지네이션과 함께 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상품 목록을 성공적으로 조회했습니다.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 크기' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: '시작 위치' })
  async findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.productsService.findAll(limit, offset);
  }

  @Get('search')
  @ApiOperation({
    summary: '상품 검색',
    description: '한국어 형태소 분석을 통한 상품 검색 기능입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과를 성공적으로 조회했습니다.',
  })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'category', required: false, description: '카테고리 필터' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: '최소 가격' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: '최대 가격' })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: [String],
    description: '태그 필터 (콤마로 구분)',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '정렬 (예: price:asc, createdAt:desc)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지 크기' })
  async search(@Query(ValidationPipe) searchQueryDto: SearchQueryDto) {
    return this.productsService.search(searchQueryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '상품 상세 조회', description: 'ID로 특정 상품을 조회합니다.' })
  @ApiResponse({
    status: 200,
    description: '상품을 성공적으로 조회했습니다.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '상품 수정', description: '기존 상품 정보를 수정합니다.' })
  @ApiResponse({
    status: 200,
    description: '상품이 성공적으로 수정되었습니다.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '상품 삭제', description: '상품을 삭제합니다.' })
  @ApiResponse({ status: 204, description: '상품이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  @ApiParam({ name: 'id', description: '상품 ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Post('seed')
  @ApiOperation({
    summary: '샘플 데이터 생성',
    description: '테스트용 샘플 상품 데이터를 생성합니다. (기본 1000개)',
  })
  @ApiResponse({
    status: 201,
    description: '샘플 데이터가 성공적으로 생성되었습니다.',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: '생성할 상품 개수',
  })
  async seed(@Query('count') count?: number) {
    return this.productsService.seed(count || 1000);
  }
}
