#!/bin/bash

# Elasticsearch 데이터 복구 스크립트
# 덤프된 상품과 유의어 데이터를 Elasticsearch에 복구

set -e

ELASTICSEARCH_URL="http://localhost:9200"
DUMP_DIR="./dump"

# 사용법 출력
usage() {
  echo "사용법: $0 [TIMESTAMP]"
  echo ""
  echo "TIMESTAMP를 지정하지 않으면 최신 덤프를 사용합니다."
  echo ""
  echo "예시:"
  echo "  $0                    # 최신 덤프 사용"
  echo "  $0 20250101_120000    # 특정 타임스탬프의 덤프 사용"
  echo ""
  echo "사용 가능한 덤프:"
  ls -1 "$DUMP_DIR"/products_*.json 2>/dev/null | grep -v latest | sed 's/.*products_\(.*\)\.json/  \1/' || echo "  (덤프 파일 없음)"
  exit 1
}

# 인자 확인
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  usage
fi

# 타임스탬프 설정
if [ -z "$1" ]; then
  echo "📁 최신 덤프 사용"
  PRODUCTS_FILE="$DUMP_DIR/products_latest.json"
  SYNONYMS_FILE="$DUMP_DIR/synonyms_latest.json"
  PRODUCTS_SETTINGS_FILE="$DUMP_DIR/products_settings_latest.json"
  PRODUCTS_MAPPING_FILE="$DUMP_DIR/products_mapping_latest.json"
  SYNONYMS_SETTINGS_FILE="$DUMP_DIR/synonyms_settings_latest.json"
  SYNONYMS_MAPPING_FILE="$DUMP_DIR/synonyms_mapping_latest.json"
else
  TIMESTAMP="$1"
  echo "📁 타임스탬프 $TIMESTAMP 덤프 사용"
  PRODUCTS_FILE="$DUMP_DIR/products_${TIMESTAMP}.json"
  SYNONYMS_FILE="$DUMP_DIR/synonyms_${TIMESTAMP}.json"
  PRODUCTS_SETTINGS_FILE="$DUMP_DIR/products_settings_${TIMESTAMP}.json"
  PRODUCTS_MAPPING_FILE="$DUMP_DIR/products_mapping_${TIMESTAMP}.json"
  SYNONYMS_SETTINGS_FILE="$DUMP_DIR/synonyms_settings_${TIMESTAMP}.json"
  SYNONYMS_MAPPING_FILE="$DUMP_DIR/synonyms_mapping_${TIMESTAMP}.json"
fi

# 파일 존재 확인
if [ ! -f "$PRODUCTS_FILE" ]; then
  echo "❌ 에러: Products 덤프 파일을 찾을 수 없습니다: $PRODUCTS_FILE"
  usage
fi

if [ ! -f "$SYNONYMS_FILE" ]; then
  echo "❌ 에러: Synonyms 덤프 파일을 찾을 수 없습니다: $SYNONYMS_FILE"
  usage
fi

echo ""
echo "🔄 Elasticsearch 데이터 복구 시작..."
echo ""

# 확인 메시지
read -p "⚠️  기존 데이터가 삭제됩니다. 계속하시겠습니까? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 복구 취소됨"
  exit 1
fi

echo ""

# 1. 기존 인덱스 삭제
echo "🗑️  기존 인덱스 삭제 중..."
curl -s -X DELETE "$ELASTICSEARCH_URL/products" > /dev/null 2>&1 || true
echo "✅ Products 인덱스 삭제됨"
curl -s -X DELETE "$ELASTICSEARCH_URL/synonyms" > /dev/null 2>&1 || true
echo "✅ Synonyms 인덱스 삭제됨"
echo ""

# 2. 인덱스 재생성 (설정과 매핑 포함)
echo "🔨 인덱스 재생성 중..."

# Products 인덱스 생성
if [ -f "$PRODUCTS_SETTINGS_FILE" ] && [ -f "$PRODUCTS_MAPPING_FILE" ]; then
  # 설정에서 인덱스 이름 키 제거하고 settings만 추출
  SETTINGS=$(cat "$PRODUCTS_SETTINGS_FILE" | jq '.products.settings')
  MAPPINGS=$(cat "$PRODUCTS_MAPPING_FILE" | jq '.products.mappings')

  curl -s -X PUT "$ELASTICSEARCH_URL/products" \
    -H 'Content-Type: application/json' \
    -d "{
      \"settings\": $SETTINGS,
      \"mappings\": $MAPPINGS
    }" > /dev/null
  echo "✅ Products 인덱스 생성됨 (설정 및 매핑 적용)"
else
  echo "⚠️  설정 파일 없음, 기본 설정으로 생성됨"
fi

# Synonyms 인덱스 생성
if [ -f "$SYNONYMS_SETTINGS_FILE" ] && [ -f "$SYNONYMS_MAPPING_FILE" ]; then
  SETTINGS=$(cat "$SYNONYMS_SETTINGS_FILE" | jq '.synonyms.settings')
  MAPPINGS=$(cat "$SYNONYMS_MAPPING_FILE" | jq '.synonyms.mappings')

  curl -s -X PUT "$ELASTICSEARCH_URL/synonyms" \
    -H 'Content-Type: application/json' \
    -d "{
      \"settings\": $SETTINGS,
      \"mappings\": $MAPPINGS
    }" > /dev/null
  echo "✅ Synonyms 인덱스 생성됨 (설정 및 매핑 적용)"
else
  echo "⚠️  설정 파일 없음, 기본 설정으로 생성됨"
fi

echo ""

# 3. Products 데이터 복구
echo "📦 Products 데이터 복구 중..."
PRODUCTS_COUNT=0

while IFS= read -r line; do
  DOC_ID=$(echo "$line" | jq -r '._id')
  SOURCE=$(echo "$line" | jq -c '._source')

  curl -s -X POST "$ELASTICSEARCH_URL/products/_doc/$DOC_ID" \
    -H 'Content-Type: application/json' \
    -d "$SOURCE" > /dev/null

  ((PRODUCTS_COUNT++))

  # 진행 상황 표시 (100개마다)
  if [ $((PRODUCTS_COUNT % 100)) -eq 0 ]; then
    echo "   복구됨: $PRODUCTS_COUNT개..."
  fi
done < "$PRODUCTS_FILE"

echo "✅ Products 복구 완료: $PRODUCTS_COUNT개"
echo ""

# 4. Synonyms 데이터 복구
echo "📚 Synonyms 데이터 복구 중..."
SYNONYMS_COUNT=0

while IFS= read -r line; do
  DOC_ID=$(echo "$line" | jq -r '._id')
  SOURCE=$(echo "$line" | jq -c '._source')

  curl -s -X POST "$ELASTICSEARCH_URL/synonyms/_doc/$DOC_ID" \
    -H 'Content-Type: application/json' \
    -d "$SOURCE" > /dev/null

  ((SYNONYMS_COUNT++))
done < "$SYNONYMS_FILE"

echo "✅ Synonyms 복구 완료: $SYNONYMS_COUNT개"
echo ""

# 5. 인덱스 새로고침
echo "🔄 인덱스 새로고침 중..."
curl -s -X POST "$ELASTICSEARCH_URL/products/_refresh" > /dev/null
curl -s -X POST "$ELASTICSEARCH_URL/synonyms/_refresh" > /dev/null
echo "✅ 새로고침 완료"
echo ""

# 6. 복구 확인
echo "✅ 복구 검증 중..."
ACTUAL_PRODUCTS=$(curl -s -X GET "$ELASTICSEARCH_URL/products/_count" | jq '.count')
ACTUAL_SYNONYMS=$(curl -s -X GET "$ELASTICSEARCH_URL/synonyms/_count" | jq '.count')

echo ""
echo "✨ 복구 완료!"
echo ""
echo "📊 복구 요약:"
echo "   - Products: $ACTUAL_PRODUCTS개 (복구: $PRODUCTS_COUNT개)"
echo "   - Synonyms: $ACTUAL_SYNONYMS개 (복구: $SYNONYMS_COUNT개)"
echo ""

if [ "$ACTUAL_PRODUCTS" -eq "$PRODUCTS_COUNT" ] && [ "$ACTUAL_SYNONYMS" -eq "$SYNONYMS_COUNT" ]; then
  echo "✅ 모든 데이터가 성공적으로 복구되었습니다!"
else
  echo "⚠️  복구된 데이터 수가 일치하지 않습니다. 확인이 필요합니다."
fi

echo ""
echo "💡 유의어 동기화가 필요합니다:"
echo "   curl -X POST http://localhost:4000/synonyms/sync"
