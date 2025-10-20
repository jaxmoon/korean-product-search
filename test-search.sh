#!/bin/bash

echo "=== 한국어 상품 검색 시스템 테스트 ==="
echo ""

echo "1. 브랜드 검색 (삼성):"
RESULT=$(curl -s "http://localhost:4000/products/search?q=%EC%82%BC%EC%84%B1&pageSize=2" --max-time 5)
echo "$RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  ✅ 총 {d['total']}건 검색, {len(d['items'])}건 반환\")"
echo ""

echo "2. 카테고리 필터 (전자제품):"
RESULT=$(curl -s "http://localhost:4000/products/search?category=%EC%A0%84%EC%9E%90%EC%A0%9C%ED%92%88&pageSize=2" --max-time 5)
echo "$RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  ✅ 총 {d['total']}건 검색, {len(d['items'])}건 반환\")"
echo ""

echo "3. 가격 범위 필터 (100,000 ~ 500,000원):"
RESULT=$(curl -s "http://localhost:4000/products/search?minPrice=100000&maxPrice=500000&pageSize=2" --max-time 5)
echo "$RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  ✅ 총 {d['total']}건 검색, {len(d['items'])}건 반환\")"
echo ""

echo "4. 복합 검색 (삼성 + 전자제품 카테고리):"
RESULT=$(curl -s "http://localhost:4000/products/search?q=%EC%82%BC%EC%84%B1&category=%EC%A0%84%EC%9E%90%EC%A0%9C%ED%92%88&pageSize=2" --max-time 5)
echo "$RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  ✅ 총 {d['total']}건 검색, {len(d['items'])}건 반환\")"
echo ""

echo "5. 정렬 테스트 (가격 오름차순):"
RESULT=$(curl -s "http://localhost:4000/products/search?sort=price:asc&pageSize=2" --max-time 5)
echo "$RESULT" | python3 -c "import sys, json; d=json.load(sys.stdin); items=d['items']; print(f\"  ✅ 첫 번째: {items[0]['name']} - {items[0]['price']:,}원\")"
echo ""

echo "=== 모든 테스트 완료 ==="
