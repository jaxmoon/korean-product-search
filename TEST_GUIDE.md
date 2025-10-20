# 한국어 상품 검색 시스템 테스트 가이드

## 🚀 빠른 시작

### 1. Swagger UI 테스트 (추천)

브라우저에서 접속:
```
http://localhost:4000/api
```

"Try it out" 버튼으로 각 API를 직접 테스트할 수 있습니다.

---

## 📋 터미널 테스트 명령어

### 기본 검색 테스트

```bash
# 1. 전체 상품 조회 (10개)
curl "http://localhost:4000/products/search"

# 2. 브랜드 검색 (삼성)
curl "http://localhost:4000/products/search?q=삼성&pageSize=5"

# 3. 카테고리 필터 (전자제품)
curl "http://localhost:4000/products/search?category=전자제품&pageSize=5"

# 4. 가격 범위 검색 (10만원 ~ 50만원)
curl "http://localhost:4000/products/search?minPrice=100000&maxPrice=500000&pageSize=5"

# 5. 복합 검색 (삼성 + 전자제품)
curl "http://localhost:4000/products/search?q=삼성&category=전자제품"
```

### 정렬 테스트

```bash
# 가격 오름차순
curl "http://localhost:4000/products/search?sort=price:asc&pageSize=3"

# 가격 내림차순
curl "http://localhost:4000/products/search?sort=price:desc&pageSize=3"

# 평점 내림차순
curl "http://localhost:4000/products/search?sort=rating:desc&pageSize=3"
```

### 한국어 형태소 분석 테스트

```bash
# "삼성" 검색 - 브랜드명으로 검색
curl "http://localhost:4000/products/search?q=삼성"

# "노트북" 검색 - 상품명에서 검색
curl "http://localhost:4000/products/search?q=노트북"

# "프리미엄" 검색 - 설명에서 검색
curl "http://localhost:4000/products/search?q=프리미엄"
```

---

## 🎨 예쁘게 보기 (jq 설치 필요)

```bash
# jq 설치 (Mac)
brew install jq

# jq로 JSON 포맷팅
curl -s "http://localhost:4000/products/search?q=삼성&pageSize=2" | jq
```

jq가 없다면 Python 사용:
```bash
curl -s "http://localhost:4000/products/search?q=삼성&pageSize=2" | python3 -m json.tool
```

---

## 🧪 자동 테스트 스크립트

프로젝트 루트에서 실행:

```bash
# 실행 권한 부여 (최초 1회)
chmod +x test-search.sh

# 테스트 실행
./test-search.sh
```

결과 예시:
```
=== 한국어 상품 검색 시스템 테스트 ===

1. 브랜드 검색 (삼성):
  ✅ 총 11건 검색, 2건 반환

2. 카테고리 필터 (전자제품):
  ✅ 총 19건 검색, 2건 반환

3. 가격 범위 필터 (100,000 ~ 500,000원):
  ✅ 총 44건 검색, 2건 반환

4. 복합 검색 (삼성 + 전자제품 카테고리):
  ✅ 총 1건 검색, 1건 반환

5. 정렬 테스트 (가격 오름차순):
  ✅ 첫 번째: 코카콜라 도서 상품 93 - 17,720원

=== 모든 테스트 완료 ===
```

---

## 📦 CRUD 작업 테스트

### 상품 생성 (POST)

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 상품",
    "description": "테스트용 상품입니다.",
    "price": 50000,
    "category": "전자제품",
    "brand": "테스트",
    "stock": 100,
    "tags": ["테스트", "신제품"],
    "rating": 4.5,
    "reviewCount": 10,
    "isActive": true
  }'
```

### 상품 조회 (GET)

```bash
# 전체 목록 (50개, 최신순)
curl "http://localhost:4000/products"

# 특정 상품 조회 (ID 필요)
curl "http://localhost:4000/products/{상품ID}"
```

### 상품 수정 (PUT)

```bash
curl -X PUT "http://localhost:4000/products/{상품ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 45000,
    "stock": 80
  }'
```

### 상품 삭제 (DELETE)

```bash
curl -X DELETE "http://localhost:4000/products/{상품ID}"
```

---

## 🔍 Elasticsearch 직접 확인

```bash
# 클러스터 상태 확인
curl "http://localhost:9200/_cluster/health?pretty"

# 인덱스 목록
curl "http://localhost:9200/_cat/indices?v"

# 상품 개수 확인
curl "http://localhost:9200/products/_count"

# 샘플 데이터 1개 조회
curl "http://localhost:9200/products/_search?size=1&pretty"
```

---

## 📊 성능 테스트

```bash
# 100개 상품 검색 시간 측정
time curl -s "http://localhost:4000/products/search?pageSize=100" > /dev/null

# 복잡한 쿼리 성능
time curl -s "http://localhost:4000/products/search?q=삼성&category=전자제품&minPrice=100000&maxPrice=500000&sort=price:asc" > /dev/null
```

---

## 🐛 문제 해결

### 1. 서버가 응답하지 않는 경우

```bash
# 서버 실행 확인
curl http://localhost:4000/health

# 예상 응답: {"status":"ok","elasticsearch":{"status":"connected","health":"green"}}
```

### 2. Elasticsearch 연결 실패

```bash
# Elasticsearch 상태 확인
curl http://localhost:9200/_cluster/health?pretty

# Docker 컨테이너 확인
docker ps | grep elastic
```

### 3. 검색 결과가 없는 경우

```bash
# 데이터 개수 확인
curl "http://localhost:9200/products/_count"

# 샘플 데이터 재생성
curl -X POST "http://localhost:4000/products/seed?count=100"
```

---

## 💡 팁

1. **Swagger UI가 가장 편합니다** - 브라우저에서 `http://localhost:4000/api` 접속
2. **한국어 검색어는 URL 인코딩 불필요** - Swagger UI가 자동으로 처리합니다
3. **터미널에서는 Python이 JSON 포맷팅에 좋습니다**
4. **테스트 스크립트**로 빠르게 전체 기능을 확인할 수 있습니다

---

## 📖 관련 문서

- API 상세 문서: `/docs/api.md`
- README: `/README.md`
- Swagger UI: `http://localhost:4000/api`
