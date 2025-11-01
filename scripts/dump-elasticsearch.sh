#!/bin/bash

# Elasticsearch 데이터 덤프 스크립트
# 상품과 유의어 데이터를 JSON 파일로 백업

set -e

ELASTICSEARCH_URL="http://localhost:9200"
DUMP_DIR="./dump"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔄 Elasticsearch 데이터 덤프 시작..."
echo "📁 덤프 디렉토리: $DUMP_DIR"
echo ""

# 덤프 디렉토리 생성
mkdir -p "$DUMP_DIR"

# 1. Products 인덱스 덤프
echo "📦 Products 인덱스 덤프 중..."
PRODUCTS_FILE="$DUMP_DIR/products_${TIMESTAMP}.json"

curl -s -X GET "$ELASTICSEARCH_URL/products/_search?size=10000&scroll=1m" \
  -H 'Content-Type: application/json' \
  -d '{"query": {"match_all": {}}}' | jq -c '.hits.hits[] | {_id, _source}' > "$PRODUCTS_FILE"

PRODUCTS_COUNT=$(wc -l < "$PRODUCTS_FILE" | tr -d ' ')
echo "✅ Products 덤프 완료: $PRODUCTS_COUNT개 문서"
echo "   파일: $PRODUCTS_FILE"
echo ""

# 2. Synonyms 인덱스 덤프
echo "📚 Synonyms 인덱스 덤프 중..."
SYNONYMS_FILE="$DUMP_DIR/synonyms_${TIMESTAMP}.json"

curl -s -X GET "$ELASTICSEARCH_URL/synonyms/_search?size=1000" \
  -H 'Content-Type: application/json' \
  -d '{"query": {"match_all": {}}}' | jq -c '.hits.hits[] | {_id, _source}' > "$SYNONYMS_FILE"

SYNONYMS_COUNT=$(wc -l < "$SYNONYMS_FILE" | tr -d ' ')
echo "✅ Synonyms 덤프 완료: $SYNONYMS_COUNT개 문서"
echo "   파일: $SYNONYMS_FILE"
echo ""

# 3. 인덱스 설정 백업
echo "⚙️  인덱스 설정 백업 중..."

# Products 인덱스 설정
PRODUCTS_SETTINGS_FILE="$DUMP_DIR/products_settings_${TIMESTAMP}.json"
curl -s -X GET "$ELASTICSEARCH_URL/products/_settings" | jq '.' > "$PRODUCTS_SETTINGS_FILE"
echo "✅ Products 설정 백업: $PRODUCTS_SETTINGS_FILE"

# Products 인덱스 매핑
PRODUCTS_MAPPING_FILE="$DUMP_DIR/products_mapping_${TIMESTAMP}.json"
curl -s -X GET "$ELASTICSEARCH_URL/products/_mapping" | jq '.' > "$PRODUCTS_MAPPING_FILE"
echo "✅ Products 매핑 백업: $PRODUCTS_MAPPING_FILE"

# Synonyms 인덱스 설정
SYNONYMS_SETTINGS_FILE="$DUMP_DIR/synonyms_settings_${TIMESTAMP}.json"
curl -s -X GET "$ELASTICSEARCH_URL/synonyms/_settings" | jq '.' > "$SYNONYMS_SETTINGS_FILE"
echo "✅ Synonyms 설정 백업: $SYNONYMS_SETTINGS_FILE"

# Synonyms 인덱스 매핑
SYNONYMS_MAPPING_FILE="$DUMP_DIR/synonyms_mapping_${TIMESTAMP}.json"
curl -s -X GET "$ELASTICSEARCH_URL/synonyms/_mapping" | jq '.' > "$SYNONYMS_MAPPING_FILE"
echo "✅ Synonyms 매핑 백업: $SYNONYMS_MAPPING_FILE"
echo ""

# 4. 최신 덤프 심볼릭 링크 생성
echo "🔗 최신 덤프 링크 생성 중..."
ln -sf "products_${TIMESTAMP}.json" "$DUMP_DIR/products_latest.json"
ln -sf "synonyms_${TIMESTAMP}.json" "$DUMP_DIR/synonyms_latest.json"
ln -sf "products_settings_${TIMESTAMP}.json" "$DUMP_DIR/products_settings_latest.json"
ln -sf "products_mapping_${TIMESTAMP}.json" "$DUMP_DIR/products_mapping_latest.json"
ln -sf "synonyms_settings_${TIMESTAMP}.json" "$DUMP_DIR/synonyms_settings_latest.json"
ln -sf "synonyms_mapping_${TIMESTAMP}.json" "$DUMP_DIR/synonyms_mapping_latest.json"
echo ""

# 요약
echo "✨ 덤프 완료!"
echo ""
echo "📊 덤프 요약:"
echo "   - Products: $PRODUCTS_COUNT개"
echo "   - Synonyms: $SYNONYMS_COUNT개"
echo "   - 타임스탬프: $TIMESTAMP"
echo ""
echo "📂 생성된 파일:"
ls -lh "$DUMP_DIR"/*_${TIMESTAMP}.json | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "💡 복구 방법:"
echo "   ./scripts/restore-elasticsearch.sh"
