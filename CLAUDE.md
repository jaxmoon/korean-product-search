# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

한국어 형태소 분석 기반 상품 검색 시스템 (Elasticsearch + Nori + NestJS)

## ⚠️ 중요: 서비스 포트

**반드시 아래 포트를 사용해야 합니다:**

| 서비스 | 포트 | 환경변수/설정파일 |
|--------|------|------------------|
| **Backend API** | **3001** | `backend/.env` PORT=3001 |
| **Admin Frontend** | **4000** | `frontend/vite.config.ts` port: 4000 |
| Elasticsearch | 9200 | docker-compose.yml |
| Kibana | 5601 | docker-compose.yml |

### 관련 설정 파일
- `backend/.env`: PORT=3001, ALLOWED_ORIGINS=http://localhost:4000
- `backend/src/main.ts`: CORS allowedOrigins에 http://localhost:4000 포함
- `frontend/vite.config.ts`: server.port = 4000, proxy target = http://localhost:3001
- `frontend/src/admin/config/env.ts`: apiBaseUrl = '/api' (Vite 프록시 사용)

## 파일 구조 규칙 ⚠️ IMPORTANT

파일을 생성할 때 반드시 아래 디렉토리 규칙을 따라야 합니다:

### 디렉토리 규칙
- **scripts/** - 모든 스크립트 파일 (데이터 생성, 배포, 유틸리티 등)
- **docs/** - 모든 문서 파일 (API 문서, 가이드, 아키텍처 문서 등)
- **docker/** - Docker 관련 파일 (Dockerfile, docker-compose, 설정 등)

### 예시

✅ **올바른 경로:**
```
scripts/seed-data.ts
scripts/create-index.ts
docs/api-guide.md
docs/architecture.md
docker/docker-compose.yml
docker/elasticsearch/Dockerfile
```

❌ **잘못된 경로:**
```
seed-data.ts (루트에 생성)
backend/scripts/seed.ts (backend 안에 생성)
elasticsearch/config/README.md (docs/ 아닌 곳에 문서)
docker-compose.yml (루트에 생성)
```

## 로컬 환경 구성 가이드

처음 프로젝트를 세팅하거나, 새로운 환경에서 시작할 때 아래 순서대로 진행하세요.

### 1단계: Docker 환경 시작

```bash
# Elasticsearch + Kibana 컨테이너 시작
make up

# 또는 docker compose 직접 사용
docker compose -f docker/docker-compose.yml up -d

# Elasticsearch 준비 확인 (healthy 상태까지 30초~1분 대기)
make es-status
```

### 2단계: 백엔드 설정

```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# .env 파일 편집 (필수: ADMIN_PASSWORD_HASH)
# Admin 비밀번호 해시 생성:
node -e "require('bcrypt').hash('your-password', 10, (e,h) => console.log(h))"
# 생성된 해시를 .env의 ADMIN_PASSWORD_HASH에 복사
```

### 3단계: 샘플 데이터 생성

```bash
# 백엔드 개발 서버 시작 (포트 4000)
npm run start:dev

# 새 터미널에서: 1000개 샘플 상품 생성
cd backend
npm run seed

# 또는 API 직접 호출
curl -X POST http://localhost:3001/products/seed
```

### 4단계: 데이터 백업 (선택사항)

```bash
# 프로젝트 루트로 이동
cd ..

# Elasticsearch 데이터 덤프 (products + synonyms)
make dump

# 또는 스크립트 직접 실행
./scripts/dump-elasticsearch.sh

# dump/ 디렉토리에 타임스탬프별 백업 파일 생성됨:
# - dump/products_YYYYMMDD_HHMMSS.json
# - dump/synonyms_YYYYMMDD_HHMMSS.json
# - dump/products_settings_YYYYMMDD_HHMMSS.json
# - dump/products_mapping_YYYYMMDD_HHMMSS.json
# - dump/synonyms_settings_YYYYMMDD_HHMMSS.json
# - dump/synonyms_mapping_YYYYMMDD_HHMMSS.json
# - dump/*_latest.json (최신 덤프 심볼릭 링크)
```

### 5단계: 데이터 복구 (필요시)

```bash
# 최신 덤프 복구
make restore

# 또는 스크립트로 특정 타임스탬프 덤프 복구
./scripts/restore-elasticsearch.sh 20250101_120000

# 복구 후 유의어 동기화
curl -X POST http://localhost:3001/synonyms/sync
```

### 환경 확인

모든 설정이 완료되면 아래 URL에 접속하여 확인:

- **백엔드 API**: http://localhost:3001
- **Swagger 문서**: http://localhost:3001/api
- **Admin Dashboard**: http://localhost:4000
- **Elasticsearch**: http://localhost:9200
- **Kibana**: http://localhost:5601

## 필수 개발 명령어

### 환경 설정 및 시작
```bash
# 전체 환경 시작 (Elasticsearch + Kibana)
make up

# 백엔드 의존성 설치
cd backend && npm install

# .env 파일 설정
cp backend/.env.example backend/.env

# 백엔드 개발 서버 시작 (포트 3001)
cd backend && npm run start:dev
```

### 데이터 관리
```bash
# 2000개 샘플 상품 데이터 생성
cd backend && npm run seed

# 또는 API로 생성
curl -X POST http://localhost:3001/products/seed
```

### 테스트
```bash
# 단위 테스트
cd backend && npm run test

# 특정 테스트 파일 실행
cd backend && npm run test -- products.service.spec.ts

# E2E 테스트
cd backend && npm run test:e2e

# 커버리지 포함
cd backend && npm run test:cov
```

### 유용한 Make 명령어
```bash
make es-status        # Elasticsearch 상태 확인
make es-indices       # 인덱스 목록 확인
make es-reindex       # products 인덱스 재생성
make logs             # 모든 서비스 로그 확인
make logs-es          # Elasticsearch 로그만 확인
make dump             # Elasticsearch 데이터 덤프 (./dump 디렉토리)
make restore          # 최신 덤프에서 데이터 복구
make clean            # 모든 컨테이너 및 볼륨 삭제
make dev-setup        # 전체 개발 환경 초기 설정
```

## 아키텍처 개요

### 모듈 구조 (NestJS)
```
backend/src/
├── app.module.ts                    # 루트 모듈 (ConfigModule 전역 설정)
├── main.ts                          # 진입점 (포트 4000, CORS, Swagger, ValidationPipe)
├── products/                        # 공개 상품 API
│   ├── products.module.ts
│   ├── products.controller.ts       # 검색, CRUD 엔드포인트
│   └── products.service.ts          # Elasticsearch 검색 로직
├── admin-products/                  # 관리자 상품 관리 (JWT 인증 필요)
├── admin-synonyms/                  # 관리자 유의어 관리
├── admin-indexes/                   # 관리자 인덱스 관리
├── admin-stats/                     # 관리자 통계
├── synonyms/                        # 공개 유의어 조회 API
├── auth/                            # JWT 인증 모듈
│   ├── auth.controller.ts           # POST /admin/auth/login
│   ├── auth.service.ts              # JWT 토큰 생성
│   └── jwt.strategy.ts              # Passport JWT 전략
└── elasticsearch/                   # Elasticsearch 클라이언트
    ├── elasticsearch.module.ts      # 전역 exports
    └── elasticsearch.service.ts     # @elastic/elasticsearch 래퍼
```

### 주요 기술적 특징

1. **Elasticsearch 통합**
   - `ElasticsearchService`가 전역적으로 제공됨
   - Nori 형태소 분석기 사용 (한국어 조사 제거, 복합어 분해)
   - 동의어 사전 지원 (노트북/랩탑, 휴대폰/핸드폰/스마트폰 등)

2. **인증 시스템**
   - JWT 기반 인증 (`@nestjs/jwt`, `passport-jwt`)
   - Admin API는 `@ApiBearerAuth('JWT-auth')` 데코레이터로 보호
   - POST /admin/auth/login에서 토큰 발급

3. **Validation**
   - 전역 `ValidationPipe` 적용 (whitelist, transform 활성화)
   - DTO에 `class-validator` 데코레이터 필수 사용

4. **CORS**
   - 개발 환경: localhost 자동 허용
   - 운영 환경: `ALLOWED_ORIGINS` 환경 변수 필수 설정

5. **API 문서**
   - Swagger UI: http://localhost:3001/api
   - 자동 JWT 인증 버튼 제공

### Elasticsearch 인덱스 설정

인덱스 매핑 (docker/elasticsearch/config/index-settings.json):
```json
{
  "name": "text (nori_analyzer)",
  "description": "text (nori_analyzer)",
  "category": "keyword",
  "price": "long",
  "stock": "integer",
  "tags": "keyword[]"
}
```

Nori 분석기 설정:
- Tokenizer: `nori_tokenizer`
- Token Filter: `nori_part_of_speech` (조사 제거)
- 동의어 처리 지원

## 환경 변수

백엔드는 `.env` 파일이 필요합니다. `.env.example`을 복사하여 설정:

```bash
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:4000
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=products
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=  # bcrypt hash 필요
```

Admin 비밀번호 해시 생성:
```bash
node -e "require('bcrypt').hash('your-password', 10, (e,h) => console.log(h))"
```

## 코딩 규칙

1. **TypeScript Strict Mode** - 모든 코드는 strict 모드 준수
2. **Class Validator** - DTO에 validation 데코레이터 필수
3. **Error Handling** - 적절한 HTTP 상태 코드와 에러 메시지
4. **Module Structure** - 기능별 모듈 분리 (products, admin-products 등)
5. **Global Services** - `ElasticsearchService`는 전역 exports로 제공

## 참고 자료

- [Swagger API 문서](http://localhost:3001/api) - 백엔드 실행 후 접속
- [상세 API 가이드](docs/api.md)
- [AWS 비용 예측 가이드](docs/aws-cost-estimation.md)
- [Elasticsearch Nori Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html)
- [NestJS Documentation](https://docs.nestjs.com/)
