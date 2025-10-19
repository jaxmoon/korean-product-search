# 한국어 상품 검색 시스템

Elasticsearch Nori 플러그인을 활용한 한국어 형태소 분석 기반 상품 검색 시스템

## 🎯 프로젝트 개요

이 프로젝트는 한국어의 특성에 맞는 검색 엔진을 구현하는 예제입니다. Elasticsearch의 Nori 형태소 분석기를 사용하여 한국어 조사 제거, 복합어 분해, 동의어 처리 등을 지원합니다.

### 주요 기능

- ✅ 한국어 형태소 분석 (Nori tokenizer)
- ✅ 상품명, 상품설명 전문 검색
- ✅ 카테고리, 가격, 태그 필터링
- ✅ 검색어 하이라이팅
- ✅ 정렬 및 페이지네이션
- ✅ 1000개 샘플 데이터 제공

## 🏗️ 기술 스택

- **검색 엔진**: Elasticsearch 8.x + Nori Plugin
- **Backend**: NestJS 11.x + TypeScript
- **데이터베이스**: Elasticsearch (문서 저장소로 활용)
- **인프라**: Docker Compose
- **모니터링**: Kibana

## 📋 요구사항

- Docker Desktop 4.0+
- Node.js 20+
- npm 또는 yarn

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 저장소 클론
git clone https://github.com/jaxmoon/korean-product-search.git
cd korean-product-search

# 환경 변수 설정
cp .env.example .env
```

### 2. Docker 환경 실행

```bash
# 전체 환경 시작 (Elasticsearch + Kibana)
make up

# 또는 docker-compose 직접 사용
docker-compose up -d
```

### 3. 백엔드 실행

```bash
# 의존성 설치
cd backend
npm install

# 개발 서버 시작
npm run start:dev
```

### 4. 샘플 데이터 생성

```bash
# 1000개 샘플 상품 데이터 생성
cd backend
npm run seed

# 또는 스크립트 직접 실행
ts-node ../scripts/seed-data.ts
```

## 📖 API 문서

### 상품 검색

```bash
# 기본 검색
GET /products/search?q=노트북

# 필터 적용
GET /products/search?q=스마트폰&category=전자제품&minPrice=300000&maxPrice=1000000

# 정렬
GET /products/search?q=이어폰&sort=price:asc

# 페이지네이션
GET /products/search?q=책&page=1&limit=20
```

### 상품 CRUD

```bash
# 상품 생성
POST /products
Content-Type: application/json

{
  "name": "갤럭시 S24 울트라",
  "description": "최신 플래그십 스마트폰",
  "category": "전자제품",
  "price": 1500000,
  "tags": ["스마트폰", "삼성", "5G"]
}

# 상품 조회
GET /products/:id

# 상품 수정
PUT /products/:id

# 상품 삭제
DELETE /products/:id
```

## 🔍 검색 예제

### 형태소 분석 예제

```bash
# "무선이어폰" 검색 → "무선", "이어폰" 으로 분해되어 검색
GET /products/search?q=무선이어폰

# "노트북을" 검색 → 조사 "을" 제거되고 "노트북" 으로 검색
GET /products/search?q=노트북을

# "핸드폰" 검색 → 동의어 "휴대폰", "스마트폰"도 함께 검색
GET /products/search?q=핸드폰
```

## 🛠️ 개발 명령어

```bash
# 전체 환경 시작
make up

# 백엔드만 재시작
make restart-backend

# 로그 확인
make logs

# Elasticsearch 상태 확인
make es-status

# 인덱스 재생성
make es-reindex

# 전체 중지
make down

# 데이터 포함 전체 삭제
make clean
```

## 📊 프로젝트 구조

```
korean-product-search/
├── backend/                    # NestJS 백엔드
│   ├── src/
│   │   ├── products/          # 상품 모듈
│   │   ├── elasticsearch/     # Elasticsearch 모듈
│   │   └── common/            # 공통 모듈
│   └── package.json
├── scripts/
│   └── seed-data.ts           # 샘플 데이터 생성 (1000개)
├── docker/
│   └── elasticsearch/
│       └── config/
│           └── index-settings.json
├── docker-compose.yml
├── Makefile
└── README.md
```

## 🔧 Elasticsearch 설정

### Nori 형태소 분석기 설정

- **Tokenizer**: nori_tokenizer
- **Token Filter**: nori_part_of_speech (조사 제거)
- **Character Filter**: 특수문자 정규화
- **User Dictionary**: 커스텀 단어 사전

### 인덱스 매핑

```json
{
  "name": "text (nori_analyzer)",
  "description": "text (nori_analyzer)",
  "category": "keyword",
  "price": "long",
  "tags": "keyword[]"
}
```

## 📈 성능 지표

- **검색 속도**: < 100ms (1000개 데이터)
- **인덱싱 속도**: ~500 docs/sec
- **정확도**: 형태소 분석으로 90%+ 재현율

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 검색 시나리오 테스트
npm run test:search
```

## 📝 참고 자료

- [Elasticsearch Nori Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

## 📄 라이센스

MIT

## 👤 작성자

**Jax Moon**

- GitHub: [@jaxmoon](https://github.com/jaxmoon)

---

## 📚 강의 자료

이 프로젝트는 한국어 검색 엔진 구축 강의를 위해 제작되었습니다.
