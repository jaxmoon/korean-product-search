#!/bin/bash

# AMOLED 제품 추가 스크립트

products=(
  "샤오미 Mi 11 아몰레드 에디션|120Hz 아몰레드 디스플레이와 고성능 프로세서 탑재|750000|샤오미"
  "오포 Find X5 AMOLED Pro|최고급 AMOLED 패널이 적용된 플래그십 모델|1290000|오포"
  "삼성 갤럭시 Z Fold AMOLED|접을 수 있는 아몰레드 디스플레이 혁신|1990000|삼성"
  "애플 iPhone 14 Pro AMOLED 스크린|Super Retina XDR AMOLED 디스플레이|1450000|애플"
  "LG Wing 듀얼 AMOLED|회전형 듀얼 아몰레드 디스플레이|990000|LG"
  "샤오미 Redmi Note 아모레드|가성비 좋은 AMOLED 스크린 탑재|450000|샤오미"
  "오포 Reno AMOLED 플러스|90Hz 아몰레드와 급속충전 지원|680000|오포"
  "삼성 갤럭시 A54 AMOLED|중급형 최고의 아몰레드 화질|590000|삼성"
)

for product in "${products[@]}"; do
  IFS='|' read -r name desc price brand <<< "$product"

  echo "추가 중: $name"

  curl -s -X POST http://localhost:4000/products \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"description\": \"$desc\",
      \"price\": $price,
      \"category\": \"전자제품\",
      \"brand\": \"$brand\",
      \"tags\": [\"AMOLED\", \"스마트폰\", \"아몰레드\"],
      \"stock\": 100,
      \"rating\": 4.6,
      \"reviewCount\": 850,
      \"isActive\": true
    }" | jq -r '.name // "생성 실패"'
done

echo ""
echo "총 ${#products[@]}개 AMOLED 제품 추가 완료"
