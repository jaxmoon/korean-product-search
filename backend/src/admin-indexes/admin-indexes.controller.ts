import { Controller, Post, Delete, Get, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@ApiTags('Admin Indexes')
@Controller('admin/indexes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminIndexesController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Post(':name/recreate')
  @ApiOperation({ summary: '인덱스 재생성 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '인덱스가 재생성되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async recreateIndex(@Param('name') name: string) {
    await this.elasticsearchService.deleteIndex(name);

    if (name === 'products') {
      await this.elasticsearchService.createProductsIndex('products', []);
      return { message: `Index '${name}' has been recreated successfully` };
    }

    return { message: `Index '${name}' recreation not supported. Only 'products' index is supported.` };
  }

  @Delete(':name')
  @ApiOperation({ summary: '인덱스 삭제 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '인덱스가 삭제되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async deleteIndex(@Param('name') name: string) {
    await this.elasticsearchService.deleteIndex(name);
    return { message: `Index '${name}' has been deleted successfully` };
  }

  @Post('reindex')
  @ApiOperation({ summary: '리인덱싱 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '리인덱싱이 완료되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async reindex(
    @Body() body: { sourceIndex: string; destIndex: string; synonyms?: string[] },
  ) {
    const { sourceIndex, destIndex, synonyms = [] } = body;

    if (synonyms.length > 0) {
      await this.elasticsearchService.updateIndexSynonyms(sourceIndex, synonyms);
      return {
        message: `Reindexing from '${sourceIndex}' to '${destIndex}' with synonyms completed`,
      };
    }

    const client = this.elasticsearchService.getClient();
    const result = await client.reindex({
      body: {
        source: { index: sourceIndex },
        dest: { index: destIndex },
      },
      wait_for_completion: true,
      refresh: true,
    });

    return {
      message: `Reindexing from '${sourceIndex}' to '${destIndex}' completed`,
      total: result.total,
      created: result.created,
      updated: result.updated,
    };
  }

  @Get(':name/stats')
  @ApiOperation({ summary: '인덱스 통계 조회 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '인덱스 통계를 반환합니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async getIndexStats(@Param('name') name: string) {
    const client = this.elasticsearchService.getClient();

    const stats = await client.indices.stats({ index: name });
    const settings = await client.indices.getSettings({ index: name });
    const mappings = await client.indices.getMapping({ index: name });

    return {
      indexName: name,
      stats: stats.indices?.[name],
      settings: settings[name]?.settings,
      mappings: mappings[name]?.mappings,
    };
  }
}
