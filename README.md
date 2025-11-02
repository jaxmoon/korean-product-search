# 한국어 상품 검색 시스템

Elasticsearch Nori 플러그인을 활용한 한국어 형태소 분석 기반 상품 검색 시스템

## 🎯 프로젝트 개요

이 프로젝트는 한국어의 특성에 맞는 검색 엔진을 구현하는 예제입니다. Elasticsearch의 Nori 형태소 분석기를 사용하여 한국어 조사 제거, 복합어 분해, 동의어 처리 등을 지원합니다.

### 주요 기능

- ✅ 한국어 형태소 분석 (Nori tokenizer)
- ✅ 동적 유의어 관리 시스템
- ✅ 상품명, 브랜드, 설명 검색
- ✅ 카테고리, 가격, 태그 필터링
- ✅ 검색어 하이라이팅
- ✅ 정렬 및 페이지네이션
- ✅ Admin Dashboard (상품/유의어 관리)
- ✅ 데이터 백업/복구 (dump/restore)
- ✅ 2000개 샘플 데이터 제공

## 🏗️ 기술 스택

- **검색 엔진**: Elasticsearch 8.x + Nori Plugin
- **Backend**: NestJS 11.x + TypeScript
- **Frontend**: React 18.x + Vite + Material-UI
- **데이터베이스**: Elasticsearch (문서 저장소로 활용)
- **인프라**: Docker Compose
- **모니터링**: Kibana

## 📋 요구사항

- Docker Desktop 4.0+
- Node.js 20+
- npm 또는 yarn

## 🌐 서비스 포트

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **Backend API** | 3001 | NestJS 백엔드 서버 |
| **Admin Dashboard** | 4000 | React 어드민 프론트엔드 |
| Elasticsearch | 9200 | 검색 엔진 |
| Kibana | 5601 | 모니터링 도구 |

**중요**: 백엔드는 **3001**, 어드민은 **4000** 포트를 사용합니다.

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

# 또는 docker compose 직접 사용
docker compose -f docker/docker-compose.yml up -d
```

### 3. 백엔드 실행

```bash
# 의존성 설치
cd backend
npm install --legacy-peer-deps

# 개발 서버 시작
npm run start:dev
```

### 4. Admin Frontend 실행 (선택사항)

```bash
# 의존성 설치
cd frontend
npm install

# 개발 서버 시작
npm run dev
```

Admin Dashboard: http://localhost:4000
- 기본 계정: admin / admin123

### 5. 샘플 데이터 생성

```bash
# Backend API를 통해 2000개 샘플 상품 생성
curl -X POST http://localhost:3001/admin/products/seed \
  -H "Content-Type: application/json" \
  -d '{"count": 2000}'
```

## 📖 API 문서

### Swagger UI (인터랙티브 문서)

애플리케이션 실행 후 브라우저에서 접속:
```
http://localhost:3001/api
```

### 상세 API 가이드

[API 사용 가이드 문서](docs/api.md)를 참고하세요. 모든 엔드포인트의 상세 설명, 요청/응답 예제, cURL 명령어가 포함되어 있습니다.

### 빠른 API 예제

#### 상품 검색

```bash
# 기본 검색
curl "http://localhost:3001/products/search?q=노트북"

# 필터 적용
curl "http://localhost:3001/products/search?q=스마트폰&category=전자제품&minPrice=300000&maxPrice=1000000"

# 정렬
curl "http://localhost:3001/products/search?q=이어폰&sort=price:asc"

# 페이지네이션
curl "http://localhost:3001/products/search?q=책&page=1&pageSize=20"
```

#### 상품 CRUD

```bash
# 상품 생성
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "갤럭시 S24 울트라",
    "description": "최신 플래그십 스마트폰",
    "category": "전자제품",
    "price": 1500000,
    "stock": 50,
    "tags": ["스마트폰", "삼성", "5G"]
  }'

# 상품 조회
curl "http://localhost:3001/products/{id}"

# 상품 수정
curl -X PUT "http://localhost:3001/products/{id}" \
  -H "Content-Type: application/json" \
  -d '{"price": 1400000}'

# 상품 삭제
curl -X DELETE "http://localhost:3001/products/{id}"
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

# 백엔드 개발 서버 시작
make backend-dev

# 로그 확인
make logs

# Elasticsearch 상태 확인
make es-status

# 데이터 백업 (dump 디렉토리에 저장)
make dump

# 데이터 복구 (최신 덤프 사용)
make restore

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
│   │   ├── synonyms/          # 유의어 모듈
│   │   ├── elasticsearch/     # Elasticsearch 모듈
│   │   ├── admin/             # Admin API 모듈
│   │   └── common/            # 공통 모듈
│   └── package.json
├── frontend/                   # React Admin Dashboard
│   ├── src/
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── components/        # 재사용 컴포넌트
│   │   └── services/          # API 서비스
│   └── package.json
├── scripts/                    # 유틸리티 스크립트
│   ├── dump-elasticsearch.sh  # 데이터 백업
│   └── restore-elasticsearch.sh # 데이터 복구
├── docs/                       # 문서
│   ├── api.md                 # API 가이드
│   └── aws-cost-estimation.md # AWS 비용 예측
├── docker/                     # Docker 설정
│   ├── docker-compose.yml
│   └── elasticsearch/
│       └── config/
│           ├── index-settings.json
│           └── product-dictionary.txt
├── dump/                       # 데이터 백업 디렉토리
├── Makefile
├── CLAUDE.md                   # Claude Code 가이드
└── README.md
```

## 🔧 Elasticsearch 설정

### Nori 형태소 분석기 설정

- **Tokenizer**: nori_tokenizer (혼합 분해 모드)
- **Token Filter**:
  - nori_part_of_speech (조사 제거)
  - synonym_filter (동적 유의어)
  - lowercase
  - korean_stop (불용어 제거)
- **User Dictionary**: 커스텀 단어 사전 (상품명, 유의어)

### 유의어 시스템

- **동적 유의어**: Admin Dashboard에서 실시간 관리
- **검색 시점 확장**: Search analyzer에 유의어 필터 적용
- **자동 동기화**: 유의어 변경 시 인덱스 재생성 (무중단)

예시:
```
엘쥐, LG, 엘지 → 모두 동일한 결과 반환
노트북, 랩탑, 랩톱, 노북 → 모두 동일한 결과 반환
```

### 인덱스 매핑

```json
{
  "name": "text (nori_analyzer + nori_synonym_analyzer)",
  "description": "text (nori_analyzer + nori_synonym_analyzer)",
  "brand": "text (nori_analyzer + nori_synonym_analyzer)",
  "category": "keyword",
  "price": "long",
  "tags": "keyword[]"
}
```

## 📈 성능 지표

- **검색 속도**: < 100ms (2000개 데이터)
- **인덱싱 속도**: ~500 docs/sec
- **정확도**: 형태소 분석 + 유의어로 95%+ 재현율
- **유의어 동기화**: < 1초 (무중단 reindex)

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
- [AWS 비용 예측 가이드](docs/aws-cost-estimation.md) - 시나리오별 AWS 배포 비용 예측 (개발/테스트, 소규모, 중규모, 대규모)

## 📄 라이센스

MIT

## 👤 작성자

**Jax Moon**

- GitHub: [@jaxmoon](https://github.com/jaxmoon)

---

## 📚 강의 자료

이 프로젝트는 한국어 검색 엔진 구축 강의를 위해 제작되었습니다.
