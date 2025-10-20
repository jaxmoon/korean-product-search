import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { ProductsService } from '../products/products.service';
import { SynonymsService } from '../synonyms/synonyms.service';

@ApiTags('Admin Stats')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminStatsController {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly productsService: ProductsService,
    private readonly synonymsService: SynonymsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '대시보드 통계를 반환합니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async getDashboardStats() {
    const client = this.elasticsearchService.getClient();

    // Products count
    const productsCount = await client.count({ index: 'products' });
    const activeProductsCount = await client.count({
      index: 'products',
      body: {
        query: {
          term: { isActive: true },
        },
      },
    });

    // Synonyms count
    const synonyms = await this.synonymsService.findAll();
    const activeSynonyms = synonyms.filter((s) => s.isActive);

    // Elasticsearch health and indices
    const health = await client.cluster.health();
    const stats = await client.indices.stats({ index: 'products' });
    const indices = Object.keys(stats.indices || {}).length;
    const documents = stats._all?.primaries?.docs?.count || 0;

    // Mock recent activity for last 7 days
    const today = new Date();
    const recentActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        action: 'activity',
        count: Math.floor(Math.random() * 50) + 10,
      };
    });

    return {
      products: {
        total: productsCount.count,
        active: activeProductsCount.count,
        inactive: productsCount.count - activeProductsCount.count,
      },
      synonyms: {
        total: synonyms.length,
        active: activeSynonyms.length,
        inactive: synonyms.length - activeSynonyms.length,
      },
      elasticsearch: {
        status: health.status === 'green' || health.status === 'yellow' ? 'healthy' : 'unhealthy',
        indices,
        documents,
      },
      recentActivity,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Elasticsearch 헬스 체크 (관리자 전용)' })
  @ApiResponse({ status: 200, description: 'Elasticsearch 상태를 반환합니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async getHealth() {
    return this.elasticsearchService.getClusterHealth();
  }

  @Get('synonyms')
  @ApiOperation({ summary: '유의어 통계 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '유의어 통계를 반환합니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async getSynonymStats() {
    const synonyms = await this.synonymsService.findAll();

    const categoryStats = synonyms.reduce(
      (acc, syn) => {
        const category = syn.category || 'uncategorized';
        if (!acc[category]) {
          acc[category] = { total: 0, active: 0, inactive: 0 };
        }
        acc[category].total++;
        if (syn.isActive) {
          acc[category].active++;
        } else {
          acc[category].inactive++;
        }
        return acc;
      },
      {} as Record<string, { total: number; active: number; inactive: number }>,
    );

    return {
      total: synonyms.length,
      active: synonyms.filter((s) => s.isActive).length,
      inactive: synonyms.filter((s) => !s.isActive).length,
      byCategory: categoryStats,
    };
  }

  @Get('products')
  @ApiOperation({ summary: '상품 통계 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '상품 통계를 반환합니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async getProductStats() {
    const client = this.elasticsearchService.getClient();

    // Total count
    const totalCount = await client.count({ index: 'products' });

    // Active products
    const activeCount = await client.count({
      index: 'products',
      body: {
        query: {
          term: { isActive: true },
        },
      },
    });

    // Category aggregation
    const categoryAgg = await client.search({
      index: 'products',
      body: {
        size: 0,
        aggs: {
          categories: {
            terms: {
              field: 'category.keyword',
              size: 100,
            },
          },
        },
      },
    });

    // Brand aggregation
    const brandAgg = await client.search({
      index: 'products',
      body: {
        size: 0,
        aggs: {
          brands: {
            terms: {
              field: 'brand.keyword',
              size: 100,
            },
          },
        },
      },
    });

    return {
      total: totalCount.count,
      active: activeCount.count,
      inactive: totalCount.count - activeCount.count,
      byCategory: (categoryAgg.aggregations?.categories as any)?.buckets || [],
      byBrand: (brandAgg.aggregations?.brands as any)?.buckets || [],
    };
  }
}
