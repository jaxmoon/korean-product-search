# 샘플 데이터 생성 스크립트 사용법

## 개요

`scripts/seed-data.ts` 스크립트는 1000개의 한국어 샘플 상품 데이터를 Elasticsearch에 색인하는 도구입니다.

## 기능

- 1000개 샘플 상품 데이터 자동 생성
- 5개 카테고리별 분류 (전자제품 300, 패션 250, 식품 200, 생활용품 150, 도서 100)
- 현실적인 한국어 상품명과 설명
- 진행률 실시간 표시
- 인덱스 자동 생성 및 준비 상태 확인

## 데이터 구조

### 카테고리별 구성

1. **전자제품 (300개)**
   - 스마트폰, 노트북, 태블릿, 이어폰, 스마트워치, 카메라
   - 브랜드: 삼성, 애플, LG, 소니, 샤오미, 델, HP, 레노버

2. **패션 (250개)**
   - 의류, 신발, 가방, 액세서리, 시계
   - 브랜드: 나이키, 아디다스, 자라, 유니클로, 노스페이스, 구찌, 프라다, 루이비통

3. **식품 (200개)**
   - 과자, 음료, 건강식품, 커피, 차
   - 브랜드: 오리온, 롯데, 해태, 농심, 빙그레, 동서식품, 남양유업

4. **생활용품 (150개)**
   - 주방용품, 청소용품, 욕실용품, 침구
   - 브랜드: 락앤락, 코렐, 쿠쿠, 한샘, 이케아, 샤오미, 다이슨

5. **도서 (100개)**
   - 소설, 자기계발, 기술서적, 만화
   - 출판사: 문학동네, 민음사, 창비, 위즈덤하우스, 한빛미디어, 길벗, 영진닷컴

### 상품 필드

```typescript
{
  name: string;           // 한국어 상품명
  description: string;    // 한국어 상품 설명 (2-3문장)
  price: number;          // 카테고리별 현실적인 가격대
  category: string;       // 카테고리명
  brand: string;          // 브랜드명
  images: string[];       // 이미지 URL (placeholder)
  stock: number;          // 재고 (10-500)
  tags: string[];         // 2-5개 태그
  rating: number;         // 1.0-5.0 평점
  reviewCount: number;    // 0-1000 리뷰 수
  isActive: boolean;      // 활성 상태 (90% true)
}
```

## 사용 방법

### 1. 전제 조건

- Elasticsearch가 실행 중이어야 함 (`make up`)
- 디스크 공간이 충분해야 함 (최소 10% 이상 여유)

### 2. 실행

```bash
# backend 디렉토리에서 실행
cd backend
npm run seed

# 또는 스크립트 직접 실행
ts-node -r tsconfig-paths/register ../scripts/seed-data.ts
```

### 3. 환경 변수

```bash
# Elasticsearch URL 설정 (기본값: http://localhost:9200)
ELASTICSEARCH_NODE=http://localhost:9200 npm run seed
```

## 출력 예시

```
🌱 Starting data seeding...
📍 Elasticsearch: http://localhost:9200
📝 Creating products index...
✅ Index created successfully
⏳ Waiting for index to be ready...
✅ Index is ready (status: green)
📦 Generated 1000 products
✅ Batch 1: 100 products indexed
📊 Progress: 100/1000 (10.0%)
✅ Batch 2: 100 products indexed
📊 Progress: 200/1000 (20.0%)
...
✅ Seeding complete!
📊 Summary:
   - Total: 1000 products
   - Success: 1000
   - Failed: 0
   - Duration: 12.34s

📋 Category breakdown:
   - 전자제품: 300
   - 패션: 250
   - 식품: 200
   - 생활용품: 150
   - 도서: 100
```

## 문제 해결

### 1. 인덱스 준비 타임아웃

```
❌ Index did not become ready in time
```

**해결책**: Elasticsearch가 정상 실행 중인지 확인

```bash
curl http://localhost:9200/_cluster/health
```

### 2. 디스크 공간 부족

```
WARN: high disk watermark [90%] exceeded
```

**해결책**:
- Docker Desktop의 디스크 공간 확보
- 불필요한 볼륨 삭제: `docker volume prune`
- 디스크 공간 늘리기

### 3. Elasticsearch 연결 실패

```
❌ Failed to check/create index: RequestTimeout
```

**해결책**:
```bash
# Elasticsearch 재시작
make down && make up

# 또는
docker compose -f docker/docker-compose.yml restart elasticsearch
```

## 인덱스 재생성

기존 데이터를 삭제하고 다시 생성하려면:

```bash
# 인덱스 삭제
curl -X DELETE http://localhost:9200/products

# 스크립트 재실행
npm run seed
```

## 인덱스 설정

스크립트는 다음 설정으로 인덱스를 자동 생성합니다:

```json
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "description": { "type": "text" },
      "price": { "type": "long" },
      "category": { "type": "keyword" },
      "brand": { "type": "keyword" },
      "images": { "type": "keyword" },
      "stock": { "type": "integer" },
      "tags": { "type": "keyword" },
      "rating": { "type": "float" },
      "reviewCount": { "type": "integer" },
      "isActive": { "type": "boolean" }
    }
  }
}
```

## 참고사항

- 스크립트는 bulk API를 사용하여 100개씩 배치로 색인합니다
- 인덱스가 이미 존재하는 경우 새로 생성하지 않습니다
- 타임아웃은 60초로 설정되어 있습니다
- Nori 형태소 분석기는 별도 설정이 필요합니다 (Issue #9 참조)
