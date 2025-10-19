# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## 프로젝트 개요

한국어 형태소 분석 기반 상품 검색 시스템 (Elasticsearch + Nori + NestJS)

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

## 프로젝트 구조

```
korean-product-search/
├── backend/                    # NestJS 백엔드 애플리케이션
│   ├── src/
│   │   ├── products/          # 상품 모듈
│   │   ├── elasticsearch/     # Elasticsearch 모듈
│   │   └── common/            # 공통 모듈
│   └── package.json
├── scripts/                    # ⭐ 모든 스크립트 파일
│   ├── seed-data.ts           # 샘플 데이터 생성
│   └── create-index.ts        # 인덱스 생성
├── docs/                       # ⭐ 모든 문서 파일
│   ├── api-guide.md           # API 가이드
│   └── search-examples.md     # 검색 예제
├── docker/                     # ⭐ Docker 관련 파일
│   ├── docker-compose.yml     # Docker Compose 설정
│   └── elasticsearch/
│       └── config/
│           └── index-settings.json
├── CLAUDE.md                   # Claude Code 가이드 (이 파일)
├── README.md                   # 프로젝트 README
└── Makefile                    # 개발 편의 명령어
```

## 기술 스택

- **검색 엔진**: Elasticsearch 8.x + Nori Plugin
- **Backend**: NestJS 11.x + TypeScript
- **인프라**: Docker Compose
- **모니터링**: Kibana

## 개발 워크플로우

### 1. 환경 설정
```bash
# Docker 환경 시작
make up

# Backend 의존성 설치
cd backend && npm install

# Backend 개발 서버 시작
npm run start:dev
```

### 2. 샘플 데이터 생성
```bash
# 1000개 샘플 상품 생성
npm run seed
```

### 3. 검색 테스트
```bash
# 검색 API 호출
curl "http://localhost:3000/products/search?q=노트북"
```

## API 엔드포인트

### 상품 검색
```
GET /products/search?q=검색어&category=카테고리&minPrice=최소가격&maxPrice=최대가격
```

### 상품 CRUD
```
POST   /products           # 상품 생성
GET    /products/:id       # 상품 조회
PUT    /products/:id       # 상품 수정
DELETE /products/:id       # 상품 삭제
POST   /products/seed      # 샘플 데이터 생성
```

## Elasticsearch 설정

### Nori 형태소 분석기
- **Tokenizer**: nori_tokenizer
- **Token Filter**: nori_part_of_speech (조사 제거)
- **동의어 사전**: 노트북/랩탑, 휴대폰/핸드폰/스마트폰 등

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

## 코딩 규칙

1. **TypeScript Strict Mode** - 모든 코드는 strict 모드 준수
2. **Class Validator** - DTO에 validation 데코레이터 필수
3. **Error Handling** - 적절한 HTTP 상태 코드와 에러 메시지
4. **Logging** - 중요한 동작은 로그 남기기
5. **Testing** - 핵심 기능은 테스트 코드 작성

## 참고 자료

- [Elasticsearch Nori Plugin](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [GitHub Issues](https://github.com/jaxmoon/korean-product-search/issues)
