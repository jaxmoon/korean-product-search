import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Search System (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same middleware as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    // Wait for Elasticsearch to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products/search (GET)', () => {
    beforeAll(async () => {
      // Seed some test data
      const testProducts = [
        {
          name: '삼성 갤럭시 노트북',
          description: '최신 프리미엄 노트북',
          price: 1500000,
          category: '전자제품',
          brand: '삼성',
          stock: 10,
          tags: ['노트북', '삼성', '전자제품'],
          isActive: true,
        },
        {
          name: '삼성 비스포크 냉장고',
          description: '스타일리시한 디자인의 냉장고',
          price: 2000000,
          category: '전자제품',
          brand: '삼성',
          stock: 5,
          tags: ['냉장고', '삼성', '가전'],
          isActive: true,
        },
        {
          name: 'LG 그램 노트북',
          description: '초경량 고성능 노트북',
          price: 1800000,
          category: '전자제품',
          brand: 'LG',
          stock: 8,
          tags: ['노트북', 'LG', '전자제품'],
          isActive: true,
        },
        {
          name: '스타벅스 아메리카노 원두',
          description: '프리미엄 원두 커피',
          price: 15000,
          category: '식품',
          brand: '스타벅스',
          stock: 100,
          tags: ['커피', '원두', '스타벅스'],
          isActive: true,
        },
      ];

      for (const product of testProducts) {
        await request(app.getHttpServer()).post('/products').send(product).expect(201);
      }

      // Wait for indexing
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it('should search with single keyword', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '노트북' })
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThan(0);
          expect(res.body.items).toBeInstanceOf(Array);
          // All results should contain "노트북"
          res.body.items.forEach((item: any) => {
            expect(item.name).toContain('노트북');
          });
        });
    });

    it('should search with multiple keywords using AND logic', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '삼성 노트북' })
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThan(0);
          // All results should contain BOTH "삼성" AND "노트북"
          res.body.items.forEach((item: any) => {
            expect(item.name).toContain('삼성');
            expect(item.name).toContain('노트북');
          });
          // Should NOT include "삼성 냉장고" (no "노트북")
          const hasRefrigerator = res.body.items.some((item: any) =>
            item.name.includes('냉장고'),
          );
          expect(hasRefrigerator).toBe(false);
        });
    });

    it('should search with synonym expansion (스벅 -> 스타벅스)', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '스벅' })
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThan(0);
          // Should find "스타벅스" products
          const hasStarbucks = res.body.items.some((item: any) =>
            item.brand.includes('스타벅스'),
          );
          expect(hasStarbucks).toBe(true);
        });
    });

    it('should search with synonym expansion (엘지 -> LG)', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '엘지' })
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThan(0);
          // Should find "LG" products
          const hasLG = res.body.items.some((item: any) => item.brand === 'LG');
          expect(hasLG).toBe(true);
        });
    });

    it('should filter by category', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '', category: '전자제품' })
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBeGreaterThan(0);
          res.body.items.forEach((item: any) => {
            expect(item.category).toBe('전자제품');
          });
        });
    });

    it('should filter by price range', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '', minPrice: 1000000, maxPrice: 1600000 })
        .expect(200)
        .expect((res) => {
          res.body.items.forEach((item: any) => {
            expect(item.price).toBeGreaterThanOrEqual(1000000);
            expect(item.price).toBeLessThanOrEqual(1600000);
          });
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '', page: 1, pageSize: 2 })
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.pageSize).toBe(2);
          expect(res.body.items.length).toBeLessThanOrEqual(2);
        });
    });

    it('should return empty results for non-existent search', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: 'nonexistent_product_xyz123' })
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBe(0);
          expect(res.body.items).toEqual([]);
        });
    });

    it('should handle invalid page number gracefully', () => {
      return request(app.getHttpServer())
        .get('/products/search')
        .query({ q: '노트북', page: -1 })
        .expect(400);
    });
  });

  describe('/synonyms (Synonym Management E2E)', () => {
    it('should create a new synonym', () => {
      return request(app.getHttpServer())
        .post('/synonyms')
        .send({
          word: '테스트유의어',
          synonyms: ['테유', '테스유'],
          category: 'test',
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.word).toBe('테스트유의어');
          expect(res.body.synonyms).toEqual(['테유', '테스유']);
        });
    });

    it('should list all synonyms', () => {
      return request(app.getHttpServer())
        .get('/synonyms')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should sync synonyms to Elasticsearch', () => {
      return request(app.getHttpServer())
        .post('/synonyms/sync')
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.count).toBeGreaterThan(0);
        });
    });

    it('should validate synonym creation', () => {
      return request(app.getHttpServer())
        .post('/synonyms')
        .send({
          word: '', // Invalid: empty word
          synonyms: [],
          category: 'test',
        })
        .expect(400);
    });

    it('should update a synonym', async () => {
      // First create a synonym
      const createResponse = await request(app.getHttpServer())
        .post('/synonyms')
        .send({
          word: '업데이트테스트',
          synonyms: ['UT'],
          category: 'test',
        })
        .expect(201);

      const synonymId = createResponse.body.id;

      // Then update it
      return request(app.getHttpServer())
        .patch(`/synonyms/${synonymId}`)
        .send({
          synonyms: ['UT', 'UTest'],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.synonyms).toContain('UTest');
        });
    });

    it('should delete a synonym', async () => {
      // First create a synonym
      const createResponse = await request(app.getHttpServer())
        .post('/synonyms')
        .send({
          word: '삭제테스트',
          synonyms: ['DT'],
          category: 'test',
        })
        .expect(201);

      const synonymId = createResponse.body.id;

      // Then delete it
      await request(app.getHttpServer()).delete(`/synonyms/${synonymId}`).expect(200);

      // Verify it's deleted
      return request(app.getHttpServer()).get(`/synonyms/${synonymId}`).expect(404);
    });
  });
});
