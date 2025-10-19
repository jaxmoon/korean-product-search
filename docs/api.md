# API 사용 가이드

한국어 상품 검색 API의 상세 사용 방법을 안내합니다.

## 목차

- [API 기본 정보](#api-기본-정보)
- [인증](#인증)
- [공통 응답 형식](#공통-응답-형식)
- [에러 처리](#에러-처리)
- [API 엔드포인트](#api-엔드포인트)
  - [상품 생성](#1-상품-생성)
  - [상품 목록 조회](#2-상품-목록-조회)
  - [상품 검색](#3-상품-검색)
  - [상품 상세 조회](#4-상품-상세-조회)
  - [상품 수정](#5-상품-수정)
  - [상품 삭제](#6-상품-삭제)
  - [샘플 데이터 생성](#7-샘플-데이터-생성)
- [검색 예제](#검색-예제)
- [Swagger UI](#swagger-ui)

## API 기본 정보

### Base URL
```
http://localhost:4000
```

### Content-Type
```
application/json
```

### 버전
현재 버전: `v1.0.0`

## 인증

현재 버전에서는 인증이 필요하지 않습니다.

## 공통 응답 형식

### 성공 응답

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": 0,
  "category": "string",
  "stock": 0,
  "brand": "string",
  "images": ["string"],
  "tags": ["string"],
  "rating": 0,
  "reviewCount": 0,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 페이지네이션 응답

```json
{
  "total": 100,
  "items": [...],
  "page": 1,
  "pageSize": 20
}
```

## 에러 처리

### 에러 응답 형식

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

### 주요 에러 코드

| 상태 코드 | 설명 |
|----------|------|
| 400 | 잘못된 요청 (유효성 검증 실패) |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

## API 엔드포인트

### 1. 상품 생성

새로운 상품을 생성하고 Elasticsearch에 인덱싱합니다.

#### Request

```http
POST /products
Content-Type: application/json

{
  "name": "삼성 갤럭시 S24 울트라",
  "description": "최신 플래그십 스마트폰으로 강력한 성능과 혁신적인 AI 기능을 제공합니다.",
  "price": 1500000,
  "category": "전자제품",
  "stock": 50,
  "brand": "삼성",
  "images": [
    "https://example.com/images/galaxy-s24-ultra-1.jpg",
    "https://example.com/images/galaxy-s24-ultra-2.jpg"
  ],
  "tags": ["스마트폰", "삼성", "5G", "AI"],
  "rating": 4.5,
  "reviewCount": 128,
  "isActive": true
}
```

#### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "abc123xyz",
  "name": "삼성 갤럭시 S24 울트라",
  "description": "최신 플래그십 스마트폰으로 강력한 성능과 혁신적인 AI 기능을 제공합니다.",
  "price": 1500000,
  "category": "전자제품",
  "stock": 50,
  "brand": "삼성",
  "images": [
    "https://example.com/images/galaxy-s24-ultra-1.jpg",
    "https://example.com/images/galaxy-s24-ultra-2.jpg"
  ],
  "tags": ["스마트폰", "삼성", "5G", "AI"],
  "rating": 4.5,
  "reviewCount": 128,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 유효성 검증

- `name`: 2-200자 필수
- `description`: 10-2000자 필수
- `price`: 0 이상 정수 필수
- `category`: 문자열 필수
- `stock`: 0 이상 정수 필수
- `brand`: 선택사항
- `images`: URL 배열 (선택사항)
- `tags`: 문자열 배열 (선택사항)
- `rating`: 0-5 사이 숫자 (선택사항)
- `reviewCount`: 0 이상 정수 (선택사항)
- `isActive`: boolean (선택사항)

### 2. 상품 목록 조회

등록된 모든 상품을 페이지네이션과 함께 조회합니다.

#### Request

```http
GET /products?limit=20&offset=0
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| limit | number | X | 50 | 페이지 크기 (1-100) |
| offset | number | X | 0 | 시작 위치 |

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "total": 1000,
  "items": [
    {
      "id": "abc123",
      "name": "상품명",
      "description": "상품 설명",
      "price": 50000,
      "category": "전자제품",
      "stock": 100,
      ...
    }
  ],
  "page": 1,
  "pageSize": 20
}
```

### 3. 상품 검색

한국어 형태소 분석을 통한 상품 검색 기능입니다.

#### Request

```http
GET /products/search?q=무선이어폰&category=전자제품&minPrice=50000&maxPrice=200000&tags=블루투스,노이즈캔슬링&sort=price:asc&page=1&pageSize=20
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| q | string | X | - | 검색어 (상품명, 설명 검색) |
| category | string | X | - | 카테고리 필터 |
| minPrice | number | X | - | 최소 가격 |
| maxPrice | number | X | - | 최대 가격 |
| tags | string | X | - | 태그 필터 (콤마로 구분) |
| sort | string | X | createdAt:desc | 정렬 (price:asc, price:desc, rating:desc, createdAt:desc, name:asc, name:desc) |
| page | number | X | 1 | 페이지 번호 |
| pageSize | number | X | 10 | 페이지 크기 (1-100) |

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "total": 45,
  "items": [
    {
      "id": "xyz789",
      "name": "프리미엄 무선 이어폰",
      "description": "노이즈 캔슬링 기능을 갖춘 고품질 무선 이어폰입니다.",
      "price": 129000,
      "category": "전자제품",
      "tags": ["무선", "이어폰", "블루투스", "노이즈캔슬링"],
      "_highlight": {
        "name": ["프리미엄 <em>무선</em> <em>이어폰</em>"],
        "description": ["<em>노이즈</em> <em>캔슬링</em> 기능을 갖춘 고품질 <em>무선</em> <em>이어폰</em>입니다."]
      },
      ...
    }
  ],
  "page": 1,
  "pageSize": 20
}
```

#### 검색 특징

- **형태소 분석**: "무선이어폰" → "무선", "이어폰"으로 분해
- **조사 제거**: "노트북을" → "노트북"으로 검색
- **동의어 지원**: "핸드폰" → "휴대폰", "스마트폰"도 검색
- **하이라이팅**: 검색어가 포함된 부분을 `<em>` 태그로 강조
- **멀티필드 검색**: 상품명(가중치 2배)과 설명 동시 검색
- **퍼지 검색**: 오타 허용 자동 매칭

### 4. 상품 상세 조회

ID로 특정 상품을 조회합니다.

#### Request

```http
GET /products/{id}
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "abc123",
  "name": "삼성 갤럭시 S24 울트라",
  "description": "최신 플래그십 스마트폰",
  "price": 1500000,
  "category": "전자제품",
  ...
}
```

#### Error Response

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "statusCode": 404,
  "message": "ID abc123인 상품을 찾을 수 없습니다.",
  "error": "Not Found"
}
```

### 5. 상품 수정

기존 상품 정보를 수정합니다.

#### Request

```http
PUT /products/{id}
Content-Type: application/json

{
  "price": 1400000,
  "stock": 30,
  "isActive": true
}
```

#### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "abc123",
  "name": "삼성 갤럭시 S24 울트라",
  "price": 1400000,
  "stock": 30,
  "isActive": true,
  "updatedAt": "2024-01-16T14:20:00.000Z",
  ...
}
```

### 6. 상품 삭제

상품을 삭제합니다.

#### Request

```http
DELETE /products/{id}
```

#### Response

```http
HTTP/1.1 204 No Content
```

### 7. 샘플 데이터 생성

테스트용 샘플 상품 데이터를 대량 생성합니다.

#### Request

```http
POST /products/seed?count=1000
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| count | number | X | 1000 | 생성할 상품 개수 |

#### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "message": "1000개의 샘플 상품이 생성되었습니다.",
  "count": 1000
}
```

## 검색 예제

### 예제 1: 기본 텍스트 검색

```bash
# "노트북" 검색
curl "http://localhost:4000/products/search?q=노트북"

# "무선이어폰" 검색 (→ "무선", "이어폰"으로 분해)
curl "http://localhost:4000/products/search?q=무선이어폰"

# "노트북을" 검색 (→ 조사 제거)
curl "http://localhost:4000/products/search?q=노트북을"
```

### 예제 2: 필터링과 정렬

```bash
# 전자제품 중 50만원 이하 상품을 가격 오름차순 정렬
curl "http://localhost:4000/products/search?category=전자제품&maxPrice=500000&sort=price:asc"

# 특정 태그를 가진 상품 검색
curl "http://localhost:4000/products/search?tags=블루투스,무선"
```

### 예제 3: 복합 검색

```bash
# "스마트폰" 검색 + 가격 범위 + 평점 정렬
curl "http://localhost:4000/products/search?q=스마트폰&minPrice=500000&maxPrice=2000000&sort=rating:desc"
```

### 예제 4: 페이지네이션

```bash
# 2페이지 조회 (페이지당 20개)
curl "http://localhost:4000/products/search?q=책&page=2&pageSize=20"
```

## Swagger UI

인터랙티브한 API 문서는 Swagger UI를 통해 확인할 수 있습니다.

### 접속

```
http://localhost:4000/api
```

### 기능

- **Try it out**: 브라우저에서 직접 API 호출 테스트
- **자동 완성**: 요청 파라미터 자동 완성 지원
- **스키마 확인**: 요청/응답 데이터 구조 확인
- **예제 값**: 각 필드의 예제 값 제공

## cURL 예제 모음

### 상품 생성

```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "애플 맥북 프로 14",
    "description": "M3 Pro 칩을 탑재한 14인치 맥북 프로",
    "price": 2790000,
    "category": "전자제품",
    "stock": 10,
    "brand": "애플",
    "tags": ["노트북", "맥북", "애플", "M3"]
  }'
```

### 상품 검색

```bash
curl "http://localhost:4000/products/search?q=맥북&category=전자제품"
```

### 상품 수정

```bash
curl -X PUT http://localhost:4000/products/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2690000,
    "stock": 5
  }'
```

### 상품 삭제

```bash
curl -X DELETE http://localhost:4000/products/abc123
```

### 샘플 데이터 생성

```bash
curl -X POST "http://localhost:4000/products/seed?count=1000"
```

## 문의 및 지원

- **GitHub**: [jaxmoon/korean-product-search](https://github.com/jaxmoon/korean-product-search)
- **이슈 제보**: [GitHub Issues](https://github.com/jaxmoon/korean-product-search/issues)

---

© 2024 Jax Moon. MIT License.
