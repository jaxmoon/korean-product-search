import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SynonymsService } from './synonyms.service';
import { CreateSynonymDto } from './dto/create-synonym.dto';
import { UpdateSynonymDto } from './dto/update-synonym.dto';
import { SynonymResponseDto } from './dto/synonym-response.dto';

@Controller('synonyms')
export class SynonymsController {
  constructor(private readonly synonymsService: SynonymsService) {}

  /**
   * 유의어 생성
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSynonymDto: CreateSynonymDto): Promise<SynonymResponseDto> {
    return this.synonymsService.create(createSynonymDto);
  }

  /**
   * 모든 유의어 조회
   */
  @Get()
  async findAll(): Promise<SynonymResponseDto[]> {
    return this.synonymsService.findAll();
  }

  /**
   * 특정 유의어 조회
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SynonymResponseDto> {
    return this.synonymsService.findOne(id);
  }

  /**
   * 유의어 수정
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSynonymDto: UpdateSynonymDto,
  ): Promise<SynonymResponseDto> {
    return this.synonymsService.update(id, updateSynonymDto);
  }

  /**
   * 유의어 삭제
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.synonymsService.remove(id);
  }

  /**
   * 대량 유의어 추가
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body() createSynonymDtos: CreateSynonymDto[],
  ): Promise<{ success: number; failed: number }> {
    return this.synonymsService.bulkCreate(createSynonymDtos);
  }

  /**
   * Elasticsearch 동기화
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync(): Promise<{ message: string; count: number }> {
    return this.synonymsService.syncToElasticsearch();
  }
}
