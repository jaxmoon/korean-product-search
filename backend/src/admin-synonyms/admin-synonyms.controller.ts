import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SynonymsService } from '../synonyms/synonyms.service';
import { CreateSynonymDto } from '../synonyms/dto/create-synonym.dto';
import { UpdateSynonymDto } from '../synonyms/dto/update-synonym.dto';

@ApiTags('Admin Synonyms')
@Controller('admin/synonyms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminSynonymsController {
  constructor(private readonly synonymsService: SynonymsService) {}

  @Post()
  @ApiOperation({ summary: '유의어 생성 (관리자 전용)' })
  @ApiResponse({ status: 201, description: '유의어가 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  create(@Body() createSynonymDto: CreateSynonymDto) {
    return this.synonymsService.create(createSynonymDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 유의어 조회 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '유의어 목록을 반환합니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  findAll() {
    return this.synonymsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 유의어 조회 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '유의어 정보를 반환합니다.' })
  @ApiResponse({ status: 404, description: '유의어를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  findOne(@Param('id') id: string) {
    return this.synonymsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '유의어 수정 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '유의어가 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '유의어를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  update(@Param('id') id: string, @Body() updateSynonymDto: UpdateSynonymDto) {
    return this.synonymsService.update(id, updateSynonymDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '유의어 삭제 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '유의어가 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '유의어를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  remove(@Param('id') id: string) {
    return this.synonymsService.remove(id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Elasticsearch 유의어 동기화 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '유의어가 Elasticsearch에 동기화되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  sync() {
    return this.synonymsService.syncToElasticsearch();
  }
}
