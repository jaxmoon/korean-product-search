import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchQueryDto } from '../common/dto/search-query.dto';
import { SearchResult, Product } from '../common/interfaces/product.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly indexName = 'products';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    try {
      const client = this.elasticsearchService.getClient();

      const now = new Date();
      const product = {
        ...createProductDto,
        createdAt: now,
        updatedAt: now,
      };

      const response = await client.index({
        index: this.indexName,
        body: product,
        refresh: 'true',
      });

      this.logger.log(`Product created with ID: ${response._id}`);

      return {
        id: response._id,
        ...product,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create product: ${err.message}`, err.stack);
      throw new BadRequestException('상품 생성에 실패했습니다.');
    }
  }

  async findAll(limit = 50, offset = 0): Promise<SearchResult<ProductResponseDto>> {
    try {
      const client = this.elasticsearchService.getClient();

      const response = await client.search({
        index: this.indexName,
        body: {
          from: offset,
          size: limit,
          query: {
            match_all: {},
          },
          sort: [{ createdAt: { order: 'desc' } }],
        },
      });

      const hits = response.hits.hits;
      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0;

      const items = hits.map((hit) => ({
        id: hit._id as string,
        ...(hit._source as Product),
      }));

      return {
        total,
        items,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to fetch products: ${err.message}`, err.stack);
      throw new BadRequestException('상품 목록 조회에 실패했습니다.');
    }
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    try {
      const client = this.elasticsearchService.getClient();

      const response = await client.get({
        index: this.indexName,
        id,
      });

      if (!response.found) {
        throw new NotFoundException(`ID ${id}인 상품을 찾을 수 없습니다.`);
      }

      return {
        id: response._id,
        ...(response._source as Product),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Failed to fetch product ${id}: ${err.message}`, err.stack);
      throw new BadRequestException('상품 조회에 실패했습니다.');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    try {
      const client = this.elasticsearchService.getClient();

      // 먼저 상품이 존재하는지 확인
      await this.findOne(id);

      const updateData = {
        ...updateProductDto,
        updatedAt: new Date(),
      };

      await client.update({
        index: this.indexName,
        id,
        body: {
          doc: updateData,
        },
        refresh: 'true',
      });

      this.logger.log(`Product ${id} updated successfully`);

      // 업데이트된 상품 반환
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Failed to update product ${id}: ${err.message}`, err.stack);
      throw new BadRequestException('상품 수정에 실패했습니다.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const client = this.elasticsearchService.getClient();

      // 먼저 상품이 존재하는지 확인
      await this.findOne(id);

      await client.delete({
        index: this.indexName,
        id,
        refresh: 'true',
      });

      this.logger.log(`Product ${id} deleted successfully`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`Failed to delete product ${id}: ${err.message}`, err.stack);
      throw new BadRequestException('상품 삭제에 실패했습니다.');
    }
  }

  async search(searchQueryDto: SearchQueryDto): Promise<SearchResult<ProductResponseDto>> {
    try {
      const client = this.elasticsearchService.getClient();
      const {
        q,
        category,
        minPrice,
        maxPrice,
        tags,
        sort,
        page = 1,
        pageSize = 20,
      } = searchQueryDto;

      const from = (page - 1) * pageSize;

      // 검색 쿼리 구성
      const must: any[] = [];
      const filter: any[] = [];

      // 텍스트 검색 (상품명, 설명)
      if (q) {
        must.push({
          multi_match: {
            query: q,
            fields: ['name^2', 'description'],
            type: 'best_fields',
            operator: 'or',
            fuzziness: 'AUTO',
          },
        });
      }

      // 카테고리 필터
      if (category) {
        filter.push({ term: { 'category.keyword': category } });
      }

      // 가격 범위 필터
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceRange: { gte?: number; lte?: number } = {};
        if (minPrice !== undefined) priceRange.gte = minPrice;
        if (maxPrice !== undefined) priceRange.lte = maxPrice;
        filter.push({ range: { price: priceRange } });
      }

      // 태그 필터
      if (tags && tags.length > 0) {
        filter.push({
          terms: { 'tags.keyword': tags },
        });
      }

      // 정렬
      const sortOption: any[] = [];
      if (sort) {
        const [field, order] = sort.split(':');
        sortOption.push({ [field]: { order: order || 'asc' } });
      } else {
        sortOption.push({ _score: { order: 'desc' } });
        sortOption.push({ createdAt: { order: 'desc' } });
      }

      const response = await client.search({
        index: this.indexName,
        body: {
          from,
          size: pageSize,
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
              filter: filter.length > 0 ? filter : undefined,
            },
          },
          sort: sortOption,
          highlight: {
            fields: {
              name: {},
              description: {},
            },
            pre_tags: ['<em>'],
            post_tags: ['</em>'],
          },
        },
      });

      const hits = response.hits.hits;
      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0;

      const items = hits.map((hit) => ({
        id: hit._id as string,
        ...(hit._source as Product),
        _highlight: hit.highlight,
      }));

      this.logger.log(`Search completed: ${total} results found for query "${q || 'all'}"`);

      return {
        total,
        items,
        page,
        pageSize,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Search failed: ${err.message}`, err.stack);
      throw new BadRequestException('검색에 실패했습니다.');
    }
  }

  async seed(count = 1000): Promise<{ message: string; count: number }> {
    try {
      this.logger.log(`Starting seed process for ${count} products...`);

      const categories = ['전자제품', '패션', '식품', '생활용품', '도서'];
      const brands = ['삼성', 'LG', '애플', '나이키', '아디다스', '스타벅스', '동원', '코카콜라'];

      const products: Partial<Product>[] = [];

      for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];

        products.push({
          name: `${brand} ${category} 상품 ${i + 1}`,
          description: `${brand}에서 출시한 프리미엄 ${category} 상품입니다. 최고의 품질과 디자인을 자랑합니다.`,
          price: Math.floor(Math.random() * 1000000) + 10000,
          category,
          brand,
          stock: Math.floor(Math.random() * 100) + 1,
          tags: [category, brand, '인기', '추천'],
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 500),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Bulk indexing (100개씩 나눠서)
      const batchSize = 100;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await this.elasticsearchService.bulkIndex(
          this.indexName,
          batch as Record<string, unknown>[],
        );
        this.logger.log(
          `Indexed ${Math.min(i + batchSize, products.length)}/${products.length} products`,
        );
      }

      this.logger.log(`Seed completed: ${count} products created`);

      return {
        message: `${count}개의 샘플 상품이 생성되었습니다.`,
        count,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Seed failed: ${err.message}`, err.stack);
      throw new BadRequestException('샘플 데이터 생성에 실패했습니다.');
    }
  }
}
