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

      // 텍스트 검색 (상품명, 설명, 브랜드)
      if (q) {
        const terms = q.trim().split(/\s+/);

        if (terms.length === 1) {
          // 단일 단어: 정확한 매칭과 형태소 매칭만 사용
          must.push({
            bool: {
              should: [
                // 정확한 매칭 (높은 스코어)
                {
                  multi_match: {
                    query: q,
                    fields: ['name^5', 'brand^3', 'description'],
                    type: 'phrase',
                  },
                },
                // 형태소 매칭 (중간 스코어)
                {
                  multi_match: {
                    query: q,
                    fields: ['name^3', 'brand^2', 'description'],
                    type: 'best_fields',
                    operator: 'and',
                  },
                },
              ],
              minimum_should_match: 1,
            },
          });
        } else {
          // 복수 단어: AND 조건 적용 (Fuzzy 없이)
          must.push({
            bool: {
              must: terms.map((term) => ({
                multi_match: {
                  query: term,
                  fields: ['name^3', 'brand^2', 'description'],
                  type: 'best_fields',
                  operator: 'and',
                },
              })),
            },
          });
        }
      }

      // 카테고리 필터
      if (category) {
        filter.push({ term: { category } });
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
          terms: { tags },
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
              brand: {},
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
      this.logger.log(`Starting seed process for ${count} realistic products...`);

      const productData: Record<string, Record<string, string[]>> = {
        전자제품: {
          삼성: [
            '갤럭시 S24 울트라',
            '갤럭시 Z 플립5',
            '갤럭시 워치6',
            'QLED 8K TV',
            '비스포크 냉장고',
            '그랑데 AI 세탁기',
          ],
          LG: [
            'LG 그램 노트북',
            'OLED TV',
            '트롬 세탁기',
            'LG 울트라 모니터',
            '오브제 냉장고',
            '퓨리케어 공기청정기',
          ],
          애플: [
            '아이폰 15 Pro',
            '맥북 에어 M3',
            '아이패드 Pro',
            '애플워치 Series 9',
            '에어팟 Pro',
            'iMac 24인치',
          ],
        },
        패션: {
          나이키: [
            '에어맥스 270',
            '조던 1 레트로',
            '에어포스 1',
            '리액트 인피니티',
            '덩크 로우',
            '줌X 바포플라이',
          ],
          아디다스: [
            '울트라부스트 22',
            '스탠스미스',
            '슈퍼스타',
            'NMD R1',
            'YEEZY 부스트',
            '포럼 로우',
          ],
          '': ['후드 티셔츠', '맨투맨', '트레이닝 팬츠', '레깅스', '바람막이', '트랙 자켓'],
        },
        식품: {
          스타벅스: [
            '아메리카노 원두',
            '카페라떼 원두',
            '파이크 플레이스 로스트',
            '시그니처 초콜릿',
            '머그컵 세트',
            '텀블러',
          ],
          동원: [
            '참치캔 85g 10입',
            '리챔',
            '양반김',
            '동원 김치찌개',
            '동원 덴마크 정통 치즈',
            '스위트콘',
          ],
          코카콜라: [
            '코카콜라 제로 1.5L',
            '코카콜라 클래식',
            '스프라이트',
            '환타 오렌지',
            '파워에이드',
            '미닛메이드',
          ],
        },
        생활용품: {
          '': [
            '세탁세제',
            '섬유유연제',
            '주방세제',
            '화장지',
            '물티슈',
            '샴푸',
            '바디워시',
            '치약',
            '칫솔',
            '비누',
          ],
        },
        도서: {
          '': [
            '프로그래밍 입문서',
            '한국 역사',
            '세계사',
            '철학 개론',
            '자기계발서',
            '경영학',
            '심리학',
            '과학',
            '수학',
            '문학',
          ],
        },
      };

      const products: Partial<Product>[] = [];

      for (let i = 0; i < count; i++) {
        const categories = Object.keys(productData);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const categoryProducts = productData[category];

        const brands = Object.keys(categoryProducts);
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const brandProducts = categoryProducts[brand];

        const productName = brandProducts[Math.floor(Math.random() * brandProducts.length)];
        const fullName = brand ? `${brand} ${productName}` : productName;

        const descriptions = [
          `최신 기술이 적용된 프리미엄 제품입니다.`,
          `편안하고 실용적인 디자인의 인기 상품입니다.`,
          `고품질 소재로 제작되어 내구성이 뛰어납니다.`,
          `일상 생활을 더욱 편리하게 만들어주는 필수 아이템입니다.`,
          `세련된 디자인과 뛰어난 성능을 자랑합니다.`,
        ];

        products.push({
          name: fullName,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          price: Math.floor(Math.random() * 1000000) + 10000,
          category,
          brand: brand || category,
          stock: Math.floor(Math.random() * 100) + 1,
          tags: [category, brand || category, '인기', '추천'].filter(Boolean),
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
