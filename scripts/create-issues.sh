#!/bin/bash

# Unset GITHUB_TOKEN to use keyring authentication
unset GITHUB_TOKEN

# Issue #2
gh issue create --title "Elasticsearch Index Configuration (Nori)" --body "## Phase 1: 환경 설정

**Scope**: ~8K tokens

### 작업 내용
- [x] Elasticsearch 인덱스 설정 파일 (\`elasticsearch/config/index-settings.json\`)
- [x] Nori tokenizer 및 analyzer 구성
- [x] 한국어 불용어, 동의어 사전 설정
- [x] 인덱스 매핑 정의 (name, description, category, price, tags)

### 산출물
- 한국어 최적화 인덱스 템플릿

### 완료 조건
- [x] Nori 형태소 분석기가 올바르게 구성됨
- [x] 동의어 사전 및 불용어 필터 설정 완료
- [x] Products 인덱스 매핑 정의 완료

**Status**: ✅ Completed"

# Issue #3
gh issue create --title "NestJS Project Initialization" --body "## Phase 2: Backend 구현

**Scope**: ~6K tokens

### 작업 내용
- [x] NestJS CLI로 프로젝트 생성
- [x] \`package.json\` 의존성 설정 (@nestjs/elasticsearch, class-validator 등)
- [x] TypeScript 설정 (\`tsconfig.json\`)
- [x] 프로젝트 구조 생성 (modules, dto, interfaces)

### 산출물
- 실행 가능한 NestJS 기본 구조

### 완료 조건
- [x] npm install 성공
- [x] TypeScript strict 모드 설정 완료
- [x] 모듈 구조 생성 완료

**Status**: ✅ Completed"

# Issue #4
gh issue create --title "Products Module - Data Structure & DTOs" --body "## Phase 2: Backend 구현

**Scope**: ~7K tokens

### 작업 내용
- [ ] \`product.interface.ts\` - Product 타입 정의
- [ ] \`create-product.dto.ts\` - 생성 DTO with validation
- [ ] \`search-product.dto.ts\` - 검색 파라미터 DTO
- [ ] \`products.module.ts\` - 모듈 구성

### 산출물
- 타입 안전한 데이터 구조

### 완료 조건
- [ ] Product 인터페이스가 Elasticsearch 매핑과 일치
- [ ] DTO에 class-validator 데코레이터 적용
- [ ] 모든 검색 파라미터가 DTO로 정의됨"

# Issue #5
gh issue create --title "Products Module - CRUD Operations" --body "## Phase 2: Backend 구현

**Scope**: ~12K tokens

### 작업 내용
- [ ] \`products.service.ts\` - 생성, 조회, 수정, 삭제 로직
- [ ] \`products.controller.ts\` - REST API 엔드포인트 (POST, GET, PUT, DELETE)
- [ ] Elasticsearch 인덱싱 통합

### 산출물
- 기본 CRUD API

### 완료 조건
- [ ] POST /products - 상품 생성 API
- [ ] GET /products/:id - 상품 조회 API
- [ ] PUT /products/:id - 상품 수정 API
- [ ] DELETE /products/:id - 상품 삭제 API
- [ ] Elasticsearch 인덱싱 동기화"

# Issue #6
gh issue create --title "Products Module - Search API" --body "## Phase 2: Backend 구현

**Scope**: ~15K tokens

### 작업 내용
- [ ] 전문 검색 쿼리 구현 (multi_match with nori)
- [ ] 필터링 (카테고리, 가격 범위, 태그)
- [ ] 정렬 및 페이지네이션
- [ ] 하이라이팅
- [ ] \`GET /products/search\` 엔드포인트

### 산출물
- 완전한 검색 API

### 완료 조건
- [ ] 한국어 형태소 분석이 적용된 전문 검색
- [ ] 카테고리, 가격, 태그 필터링 지원
- [ ] 정렬 (관련도, 가격, 최신순)
- [ ] 페이지네이션 (offset/limit)
- [ ] 검색어 하이라이팅"

# Issue #7
gh issue create --title "Elasticsearch Module Implementation" --body "## Phase 2: Backend 구현

**Scope**: ~10K tokens

### 작업 내용
- [ ] \`elasticsearch.module.ts\` - ElasticsearchModule 설정
- [ ] \`elasticsearch.service.ts\` - 인덱스 생성, 검색 추상화 메서드
- [ ] Connection 설정 및 헬스체크

### 산출물
- 재사용 가능한 Elasticsearch 서비스 레이어

### 완료 조건
- [ ] Elasticsearch 연결 확인
- [ ] 인덱스 생성 메서드 구현
- [ ] 헬스체크 API 구현"

# Issue #8
gh issue create --title "Sample Data Generator Script" --body "## Phase 3: 데이터 & 테스트

**Scope**: ~10K tokens

### 작업 내용
- [ ] \`scripts/seed-data.ts\` - 샘플 데이터 생성 로직
- [ ] 카테고리별 상품 템플릿 (전자제품, 패션, 식품, 생활용품, 도서)
- [ ] 한국어 상품명/설명 생성 함수
- [ ] 랜덤 가격, 태그 생성

### 산출물
- 1000개 생성 가능한 스크립트

### 완료 조건
- [ ] 1000개의 다양한 샘플 상품 데이터 생성
- [ ] 각 카테고리별로 현실적인 상품명과 설명
- [ ] 가격, 태그, 재고 등 모든 필드 포함"

# Issue #9
gh issue create --title "Seed 1000 Products & Verify Indexing" --body "## Phase 3: 데이터 & 테스트

**Scope**: ~5K tokens

### 작업 내용
- [ ] 스크립트 실행 및 Elasticsearch 인덱싱
- [ ] Kibana Dev Tools로 인덱싱 확인
- [ ] 인덱스 통계 및 매핑 검증

### 산출물
- 1000개 샘플 데이터가 색인된 시스템

### 완료 조건
- [ ] 1000개 상품이 Elasticsearch에 정상 색인
- [ ] 인덱스 매핑이 설정대로 적용됨
- [ ] Kibana에서 데이터 확인 가능"

# Issue #10
gh issue create --title "Search Testing & Validation" --body "## Phase 3: 데이터 & 테스트

**Scope**: ~12K tokens

### 작업 내용
- [ ] 형태소 분석 테스트 (조사 제거, 복합어 분해)
- [ ] 검색 시나리오 테스트 (10개 케이스)
- [ ] 필터 조합 테스트
- [ ] 성능 측정 (응답 시간, 정확도)
- [ ] 테스트 결과 문서화

### 산출물
- 검증된 검색 시스템 + 테스트 리포트

### 완료 조건
- [ ] 형태소 분석 정상 동작 확인
- [ ] 동의어 검색 동작 확인
- [ ] 필터링 및 정렬 동작 확인
- [ ] 응답 시간 < 100ms
- [ ] 테스트 결과 문서 작성"

# Issue #11
gh issue create --title "Documentation & Development Guide" --body "## Phase 4: 문서화

**Scope**: ~8K tokens

### 작업 내용
- [ ] \`README.md\` - 프로젝트 소개, 아키텍처, 실행 방법
- [ ] API 문서 (Swagger 또는 Markdown)
- [ ] 개발 가이드 - 로컬 환경 설정, 트러블슈팅
- [ ] 검색 쿼리 예제 모음

### 산출물
- 완성된 프로젝트 문서

### 완료 조건
- [ ] README에 프로젝트 전체 설명 완료
- [ ] API 엔드포인트 문서화
- [ ] 개발 환경 설정 가이드
- [ ] 검색 예제 및 트러블슈팅 가이드"

echo "✅ All issues created successfully!"
