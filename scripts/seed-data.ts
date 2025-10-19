#!/usr/bin/env ts-node
import { Client } from '@elastic/elasticsearch';

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

// 카테고리별 템플릿 정의
const categoryTemplates = {
  electronics: {
    brands: ['삼성', '애플', 'LG', '소니', '샤오미', '델', 'HP', '레노버'],
    subcategories: {
      smartphone: {
        products: [
          '갤럭시 S24 울트라', '갤럭시 S24', '갤럭시 S23',
          '아이폰 15 Pro Max', '아이폰 15 Pro', '아이폰 15',
          '샤오미 14 Pro', '샤오미 13', 'V30',
          '갤럭시 Z Fold5', '갤럭시 Z Flip5'
        ],
        specs: ['256GB', '512GB', '자급제', '공기계', '리퍼'],
        descriptions: [
          '최신 플래그십 스마트폰으로 강력한 성능과 뛰어난 카메라를 자랑합니다. 일상 사용부터 게임까지 모든 작업을 부드럽게 처리합니다.',
          '프리미엄 스마트폰으로 세련된 디자인과 혁신적인 기능을 제공합니다. 고성능 프로세서와 대용량 배터리로 하루 종일 사용 가능합니다.',
          '혁신적인 기술이 집약된 스마트폰입니다. 뛰어난 화질의 디스플레이와 전문가급 카메라 시스템을 경험하세요.'
        ],
        tags: ['스마트폰', '5G', '플래그십', '고성능', '카메라'],
        priceRange: { min: 500000, max: 2000000 }
      },
      laptop: {
        products: [
          '맥북 프로 14', '맥북 에어 M2', 'LG 그램 17',
          'LG 그램 16', '갤럭시북 프로', '델 XPS 15',
          'HP 엔비 13', '레노버 씽크패드 X1'
        ],
        specs: ['16GB RAM', '32GB RAM', '512GB SSD', '1TB SSD', 'M2 칩', 'i7'],
        descriptions: [
          '강력한 성능과 긴 배터리 수명을 자랑하는 프리미엄 노트북입니다. 업무부터 창작까지 모든 작업에 완벽합니다.',
          '초경량 디자인과 뛰어난 성능을 겸비한 노트북입니다. 이동이 잦은 비즈니스맨에게 최적화되어 있습니다.',
          '고해상도 디스플레이와 강력한 프로세서를 탑재한 노트북입니다. 전문적인 작업 환경을 제공합니다.'
        ],
        tags: ['노트북', '울트라북', '고성능', '휴대성'],
        priceRange: { min: 1000000, max: 4000000 }
      },
      tablet: {
        products: [
          '갤럭시 탭 S9', '갤럭시 탭 S9 플러스', '아이패드 프로 12.9',
          '아이패드 에어', '아이패드 10세대', '샤오미 패드 6'
        ],
        specs: ['128GB', '256GB', '512GB', 'WiFi', 'WiFi+Cellular', '펜 포함'],
        descriptions: [
          '대화면 디스플레이와 강력한 성능의 프리미엄 태블릿입니다. 업무와 엔터테인먼트를 동시에 즐기세요.',
          '휴대성과 성능을 모두 갖춘 태블릿입니다. 창작 작업에 최적화된 펜 지원으로 아이디어를 자유롭게 표현하세요.',
          '다양한 용도로 활용 가능한 만능 태블릿입니다. 고성능 칩셋으로 어떤 작업도 부드럽게 처리합니다.'
        ],
        tags: ['태블릿', '대화면', '펜 지원', '멀티미디어'],
        priceRange: { min: 400000, max: 2000000 }
      },
      earphone: {
        products: [
          '갤럭시 버즈2 프로', '에어팟 프로 2세대', '에어팟 3세대',
          '소니 WF-1000XM5', '보스 QC 이어버드', 'LG 톤프리'
        ],
        specs: ['노이즈캔슬링', 'ANC', '블루투스 5.3', '무선충전', '방수'],
        descriptions: [
          '프리미엄 노이즈 캔슬링 기능을 탑재한 무선 이어폰입니다. 완벽한 음질로 음악에 몰입하세요.',
          '편안한 착용감과 뛰어난 음질을 자랑하는 이어폰입니다. 긴 배터리 수명으로 하루 종일 사용 가능합니다.',
          '스마트한 기능과 우수한 음질의 무선 이어폰입니다. 활동적인 라이프스타일에 완벽하게 어울립니다.'
        ],
        tags: ['이어폰', '무선', '노이즈캔슬링', 'ANC', '블루투스'],
        priceRange: { min: 100000, max: 400000 }
      },
      smartwatch: {
        products: [
          '갤럭시 워치6', '갤럭시 워치6 클래식', '애플워치 시리즈 9',
          '애플워치 SE 2세대', '샤오미 워치 S3'
        ],
        specs: ['GPS', 'LTE', '건강측정', '수면추적', 'AMOLED'],
        descriptions: [
          '다양한 건강 기능을 탑재한 스마트워치입니다. 운동, 수면, 스트레스를 모두 관리할 수 있습니다.',
          '세련된 디자인과 실용적인 기능의 스마트워치입니다. 일상생활을 더욱 편리하게 만들어줍니다.',
          '프리미엄 스마트워치로 건강과 피트니스를 완벽하게 관리하세요. 다양한 운동 모드를 지원합니다.'
        ],
        tags: ['스마트워치', '헬스케어', '피트니스', 'GPS'],
        priceRange: { min: 200000, max: 700000 }
      },
      camera: {
        products: [
          '소니 A7 IV', '캐논 EOS R6', '니콘 Z6 II',
          '후지필름 X-T5', '고프로 히어로 12'
        ],
        specs: ['풀프레임', 'APS-C', '미러리스', '4K 60fps', '손떨림보정'],
        descriptions: [
          '전문가급 사진과 영상 촬영이 가능한 카메라입니다. 뛰어난 화질과 성능으로 최고의 결과물을 만들어냅니다.',
          '고성능 미러리스 카메라로 순간을 완벽하게 포착합니다. 다양한 렌즈 호환성으로 창작의 자유를 누리세요.',
          '프리미엄 이미지 센서와 강력한 프로세서를 탑재한 카메라입니다. 전문적인 촬영 환경을 제공합니다.'
        ],
        tags: ['카메라', '미러리스', '풀프레임', '전문가용'],
        priceRange: { min: 1500000, max: 5000000 }
      }
    }
  },
  fashion: {
    brands: ['나이키', '아디다스', '자라', '유니클로', '노스페이스', '구찌', '프라다', '루이비통'],
    subcategories: {
      clothing: {
        products: [
          '후디 집업', '맨투맨', '니트 스웨터', '카라 티셔츠',
          '청바지', '슬랙스', '패딩 점퍼', '코트', '롱패딩'
        ],
        specs: ['S', 'M', 'L', 'XL', '면 100%', '방수', '겨울용'],
        descriptions: [
          '편안한 착용감과 세련된 디자인의 의류입니다. 일상복으로 완벽한 선택입니다.',
          '고급스러운 소재로 제작된 프리미엄 의류입니다. 어떤 스타일링에도 잘 어울립니다.',
          '트렌디한 디자인과 실용성을 겸비한 옷입니다. 사계절 내내 착용 가능합니다.'
        ],
        tags: ['의류', '캐주얼', '데일리', '트렌디'],
        priceRange: { min: 30000, max: 500000 }
      },
      shoes: {
        products: [
          '에어 조던 1', '에어 맥스 97', '스탠 스미스',
          '슈퍼스타', '척 테일러', '뉴발란스 530'
        ],
        specs: ['230mm', '240mm', '250mm', '260mm', '270mm', '280mm'],
        descriptions: [
          '편안한 착용감과 스타일리시한 디자인의 운동화입니다. 일상생활에서 운동까지 다용도로 활용 가능합니다.',
          '클래식한 디자인의 스니커즈로 어떤 옷과도 잘 어울립니다. 오래 걸어도 편안한 착화감을 제공합니다.',
          '프리미엄 소재와 뛰어난 쿠셔닝의 운동화입니다. 발의 피로를 최소화하고 스타일을 완성합니다.'
        ],
        tags: ['신발', '운동화', '스니커즈', '캐주얼'],
        priceRange: { min: 80000, max: 300000 }
      },
      bag: {
        products: [
          '백팩', '크로스백', '숄더백', '토트백',
          '클러치', '여행용 캐리어'
        ],
        specs: ['15L', '20L', '30L', '가죽', '나일론', '방수'],
        descriptions: [
          '실용적이고 세련된 디자인의 가방입니다. 수납공간이 넉넉하여 일상생활에 최적입니다.',
          '고급스러운 소재와 완벽한 마감의 프리미엄 백입니다. 어떤 상황에도 품격을 더해줍니다.',
          '가볍고 튼튼한 가방으로 여행과 출퇴근에 완벽합니다. 다양한 수납공간으로 편리함을 제공합니다.'
        ],
        tags: ['가방', '백팩', '수납', '패션'],
        priceRange: { min: 50000, max: 2000000 }
      },
      accessory: {
        products: [
          '선글라스', '벨트', '지갑', '모자',
          '스카프', '넥타이', '양말'
        ],
        specs: ['가죽', '실크', '울', '면'],
        descriptions: [
          '스타일을 완성하는 필수 액세서리입니다. 고급스러운 디테일이 돋보입니다.',
          '실용성과 패션성을 겸비한 제품입니다. 다양한 스타일에 매치하기 좋습니다.',
          '세련된 디자인의 프리미엄 액세서리입니다. 선물용으로도 완벽한 선택입니다.'
        ],
        tags: ['액세서리', '패션소품', '스타일'],
        priceRange: { min: 10000, max: 500000 }
      },
      watch: {
        products: [
          '롤렉스 서브마리너', '오메가 스피드마스터',
          '태그호이어 카레라', '세이코 프레사지'
        ],
        specs: ['자동', '쿼츠', '방수 100m', '사파이어 크리스탈'],
        descriptions: [
          '정교한 기계식 무브먼트를 탑재한 럭셔리 시계입니다. 시간을 넘어 가치를 담았습니다.',
          '클래식한 디자인과 뛰어난 내구성의 시계입니다. 평생 함께할 수 있는 타임피스입니다.',
          '세련된 스타일과 정확한 시간 표시의 프리미엄 워치입니다. 어떤 상황에도 완벽합니다.'
        ],
        tags: ['시계', '명품', '럭셔리', '기계식'],
        priceRange: { min: 500000, max: 10000000 }
      }
    }
  },
  food: {
    brands: ['오리온', '롯데', '해태', '농심', '빙그레', '동서식품', '남양유업'],
    subcategories: {
      snack: {
        products: [
          '포카칩', '치토스', '새우깡', '허니버터칩',
          '초코파이', '빼빼로', '칸쵸', '꼬북칩'
        ],
        specs: ['오리지널', '매운맛', '치즈맛', '양파맛', '대용량'],
        descriptions: [
          '바삭하고 고소한 맛이 일품인 스낵입니다. 간식으로 완벽하며 모임에서도 인기만점입니다.',
          '중독성 있는 맛으로 한번 먹으면 멈출 수 없는 과자입니다. 온 가족이 함께 즐기기 좋습니다.',
          '고급 재료로 만든 프리미엄 스낵입니다. 깔끔한 맛과 바삭한 식감을 자랑합니다.'
        ],
        tags: ['과자', '스낵', '간식', '대용량'],
        priceRange: { min: 1500, max: 15000 }
      },
      beverage: {
        products: [
          '콜라', '사이다', '환타', '밀키스',
          '게토레이', '포카리스웨트', '데자와', '맥콜'
        ],
        specs: ['250ml', '500ml', '1.5L', '2L', '탄산', '무탄산'],
        descriptions: [
          '상쾌하고 시원한 음료수입니다. 갈증 해소에 완벽하며 언제 어디서나 즐길 수 있습니다.',
          '건강을 생각한 기능성 음료입니다. 운동 후 수분 보충에 최적화되어 있습니다.',
          '달콤하고 깔끔한 맛의 음료입니다. 식사와 함께 또는 간식으로 즐기기 좋습니다.'
        ],
        tags: ['음료', '음료수', '탄산', '시원한'],
        priceRange: { min: 1000, max: 3000 }
      },
      health: {
        products: [
          '비타민C', '오메가3', '프로바이오틱스',
          '루테인', '밀크씨슬', '홍삼'
        ],
        specs: ['30정', '60정', '90정', '건강기능식품'],
        descriptions: [
          '건강한 생활을 위한 프리미엄 건강기능식품입니다. 매일 섭취하여 활력 있는 하루를 시작하세요.',
          '엄선된 원료로 만든 고품질 건강식품입니다. 면역력 증진과 건강 유지에 도움을 줍니다.',
          '과학적으로 검증된 기능성 원료를 함유한 제품입니다. 일상 건강 관리에 필수입니다.'
        ],
        tags: ['건강식품', '영양제', '비타민', '면역력'],
        priceRange: { min: 10000, max: 100000 }
      },
      coffee: {
        products: [
          '맥심 모카골드', '카누 라떼', '스타벅스 원두',
          '블루보틀 원두', '네스프레소 캡슐'
        ],
        specs: ['100g', '200g', '500g', '드립백', '캡슐', '인스턴트'],
        descriptions: [
          '깊고 풍부한 향의 프리미엄 커피입니다. 아침을 상쾌하게 시작할 수 있습니다.',
          '편리하게 즐기는 고품질 커피입니다. 언제 어디서나 카페 수준의 맛을 경험하세요.',
          '엄선된 원두로 만든 최상급 커피입니다. 커피 애호가들의 선택입니다.'
        ],
        tags: ['커피', '원두', '아메리카노', '라떼'],
        priceRange: { min: 5000, max: 50000 }
      },
      tea: {
        products: [
          '녹차', '홍차', '우롱차', '허브티',
          '캐모마일', '페퍼민트', '루이보스'
        ],
        specs: ['20티백', '50티백', '100g', '유기농'],
        descriptions: [
          '은은한 향과 깊은 맛의 프리미엄 차입니다. 여유로운 티타임을 즐겨보세요.',
          '건강에 좋은 천연 성분의 차입니다. 몸과 마음을 편안하게 만들어줍니다.',
          '최상급 찻잎으로 만든 고급 차입니다. 선물용으로도 완벽한 선택입니다.'
        ],
        tags: ['차', '티', '건강차', '허브'],
        priceRange: { min: 5000, max: 30000 }
      }
    }
  },
  living: {
    brands: ['락앤락', '코렐', '쿠쿠', '한샘', '이케아', '샤오미', '다이슨'],
    subcategories: {
      kitchen: {
        products: [
          '냄비세트', '프라이팬', '그릇세트', '수저세트',
          '밀폐용기', '전기밥솥', '에어프라이어', '믹서기'
        ],
        specs: ['스테인리스', '코팅', '유리', '세라믹'],
        descriptions: [
          '튼튼하고 실용적인 주방용품입니다. 오래 사용해도 변형이 없고 위생적입니다.',
          '요리를 더욱 즐겁게 만들어주는 프리미엄 주방용품입니다. 편리한 기능으로 조리가 쉬워집니다.',
          '세련된 디자인과 뛰어난 기능성의 주방 도구입니다. 건강한 요리를 위한 최고의 선택입니다.'
        ],
        tags: ['주방용품', '조리도구', '식기'],
        priceRange: { min: 10000, max: 500000 }
      },
      cleaning: {
        products: [
          '청소기', '물걸레청소기', '스팀청소기',
          '세제', '섬유유연제', '락스'
        ],
        specs: ['무선', '유선', '친환경', '대용량'],
        descriptions: [
          '강력한 흡입력으로 집안 구석구석 깨끗하게 청소합니다. 편리한 사용으로 청소가 즐거워집니다.',
          '효과적인 세정력으로 찌든 때도 깨끗이 제거합니다. 친환경 성분으로 안심하고 사용할 수 있습니다.',
          '시간을 절약해주는 스마트 청소용품입니다. 집안을 항상 청결하게 유지하세요.'
        ],
        tags: ['청소용품', '세제', '청소기'],
        priceRange: { min: 5000, max: 1000000 }
      },
      bathroom: {
        products: [
          '샴푸', '린스', '바디워시', '치약',
          '칫솔', '수건', '목욕가운'
        ],
        specs: ['500ml', '1L', '천연', '유기농'],
        descriptions: [
          '피부와 모발을 건강하게 가꿔주는 프리미엄 제품입니다. 매일 사용하기 좋은 순한 성분입니다.',
          '상쾌한 향과 부드러운 사용감의 욕실용품입니다. 하루의 피로를 말끔히 씻어냅니다.',
          '온 가족이 안심하고 사용할 수 있는 욕실 필수품입니다. 고급스러운 향으로 기분까지 좋아집니다.'
        ],
        tags: ['욕실용품', '바디케어', '헤어케어'],
        priceRange: { min: 3000, max: 50000 }
      },
      bedding: {
        products: [
          '베개', '이불', '매트리스', '침대커버',
          '베개커버', '토퍼', '여름이불'
        ],
        specs: ['싱글', '퀸', '킹', '면', '극세사'],
        descriptions: [
          '편안한 수면을 위한 프리미엄 침구입니다. 부드러운 촉감으로 숙면을 도와줍니다.',
          '고급스러운 소재와 세련된 디자인의 침구세트입니다. 침실 인테리어를 완성합니다.',
          '사계절 내내 쾌적한 수면 환경을 제공하는 침구입니다. 위생적이고 관리가 쉽습니다.'
        ],
        tags: ['침구', '베개', '이불', '숙면'],
        priceRange: { min: 20000, max: 500000 }
      }
    }
  },
  book: {
    brands: ['문학동네', '민음사', '창비', '위즈덤하우스', '한빛미디어', '길벗', '영진닷컴'],
    subcategories: {
      novel: {
        products: [
          '미드나잇 라이브러리', '달러구트 꿈 백화점',
          '트렌드 코리아', '아몬드', '82년생 김지영'
        ],
        specs: ['양장본', '페이퍼백', '전자책 포함'],
        descriptions: [
          '감동적인 스토리로 많은 독자들의 사랑을 받는 소설입니다. 한번 읽기 시작하면 멈출 수 없습니다.',
          '현대인의 삶과 고민을 섬세하게 그려낸 작품입니다. 공감과 위로를 동시에 전해줍니다.',
          '베스트셀러 작가의 신작으로 출간 즉시 화제가 된 책입니다. 읽는 내내 몰입감이 뛰어납니다.'
        ],
        tags: ['소설', '베스트셀러', '문학', '감동'],
        priceRange: { min: 10000, max: 30000 }
      },
      self_improvement: {
        products: [
          '아주 작은 습관의 힘', '데일 카네기 인간관계론',
          '부의 추월차선', '돈의 속성', '하버드 새벽 4시 반'
        ],
        specs: ['양장본', '페이퍼백'],
        descriptions: [
          '인생을 변화시키는 실용적인 조언이 가득한 자기계발서입니다. 더 나은 내일을 만들어갑니다.',
          '전 세계적으로 검증된 성공 원리를 담은 책입니다. 목표를 이루는 구체적인 방법을 제시합니다.',
          '현실적이고 실천 가능한 자기계발 전략을 제공합니다. 지금 바로 시작할 수 있는 변화의 첫걸음입니다.'
        ],
        tags: ['자기계발', '성공', '습관', '동기부여'],
        priceRange: { min: 13000, max: 25000 }
      },
      tech: {
        products: [
          '클린 코드', '리팩토링', '오브젝트',
          '자바스크립트 완벽 가이드', 'Do it! 점프 투 파이썬'
        ],
        specs: ['컬러', '흑백', '전자책 포함'],
        descriptions: [
          '개발자 필독서로 실무에 바로 적용 가능한 내용이 담겨있습니다. 코드 품질을 한 단계 높여줍니다.',
          '최신 기술 트렌드를 반영한 실용 기술서입니다. 초보부터 전문가까지 모두에게 유용합니다.',
          '체계적인 설명과 풍부한 예제로 학습 효과를 극대화한 책입니다. IT 전문가로 성장하는 지름길입니다.'
        ],
        tags: ['프로그래밍', '개발', '기술서', 'IT'],
        priceRange: { min: 25000, max: 60000 }
      },
      comic: {
        products: [
          '원피스', '귀멸의 칼날', '나의 히어로 아카데미아',
          '슬램덩크', '드래곤볼'
        ],
        specs: ['단행본', '합본'],
        descriptions: [
          '전 세계적으로 사랑받는 인기 만화입니다. 재미있는 스토리와 멋진 그림체가 일품입니다.',
          '감동과 재미를 동시에 선사하는 만화책입니다. 남녀노소 누구나 즐길 수 있습니다.',
          '중독성 있는 전개로 시리즈를 완독하게 만드는 만화입니다. 여가 시간을 즐겁게 보낼 수 있습니다.'
        ],
        tags: ['만화', '코믹', '시리즈'],
        priceRange: { min: 5000, max: 15000 }
      }
    }
  }
};

// 랜덤 유틸리티 함수
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// 카테고리별 상품 생성 함수
function generateElectronicsProducts(count: number): ProductSeed[] {
  const products: ProductSeed[] = [];
  const template = categoryTemplates.electronics;
  const subcategoryKeys = Object.keys(template.subcategories) as Array<keyof typeof template.subcategories>;
  const productsPerSubcategory = Math.floor(count / subcategoryKeys.length);

  for (const subcategoryKey of subcategoryKeys) {
    const subcategory = template.subcategories[subcategoryKey];
    const subcategoryCount = subcategoryKey === subcategoryKeys[subcategoryKeys.length - 1]
      ? count - (products.length)
      : productsPerSubcategory;

    for (let i = 0; i < subcategoryCount; i++) {
      const brand = randomChoice(template.brands);
      const productName = randomChoice(subcategory.products);
      const spec = randomChoice(subcategory.specs);
      const description = randomChoice(subcategory.descriptions);
      const price = randomInt(subcategory.priceRange.min, subcategory.priceRange.max);
      const tags = randomChoices(subcategory.tags, randomInt(2, 4));

      products.push({
        name: `${brand} ${productName} ${spec}`,
        description: description,
        price: price,
        category: '전자제품',
        brand: brand,
        images: [
          `https://placehold.co/800x800/png?text=${encodeURIComponent(productName)}`,
          `https://placehold.co/800x800/png?text=${encodeURIComponent(brand)}`
        ],
        stock: randomInt(10, 500),
        tags: tags,
        rating: randomFloat(3.5, 5.0),
        reviewCount: randomInt(0, 1000),
        isActive: Math.random() > 0.1
      });
    }
  }

  return products;
}

function generateFashionProducts(count: number): ProductSeed[] {
  const products: ProductSeed[] = [];
  const template = categoryTemplates.fashion;
  const subcategoryKeys = Object.keys(template.subcategories) as Array<keyof typeof template.subcategories>;
  const productsPerSubcategory = Math.floor(count / subcategoryKeys.length);

  for (const subcategoryKey of subcategoryKeys) {
    const subcategory = template.subcategories[subcategoryKey];
    const subcategoryCount = subcategoryKey === subcategoryKeys[subcategoryKeys.length - 1]
      ? count - (products.length)
      : productsPerSubcategory;

    for (let i = 0; i < subcategoryCount; i++) {
      const brand = randomChoice(template.brands);
      const productName = randomChoice(subcategory.products);
      const spec = randomChoice(subcategory.specs);
      const description = randomChoice(subcategory.descriptions);
      const price = randomInt(subcategory.priceRange.min, subcategory.priceRange.max);
      const tags = randomChoices(subcategory.tags, randomInt(2, 5));

      products.push({
        name: `${brand} ${productName} ${spec}`,
        description: description,
        price: price,
        category: '패션',
        brand: brand,
        images: [
          `https://placehold.co/800x800/png?text=${encodeURIComponent(productName)}`,
          `https://placehold.co/800x800/png?text=${encodeURIComponent(brand)}`
        ],
        stock: randomInt(10, 300),
        tags: tags,
        rating: randomFloat(3.0, 5.0),
        reviewCount: randomInt(0, 800),
        isActive: Math.random() > 0.1
      });
    }
  }

  return products;
}

function generateFoodProducts(count: number): ProductSeed[] {
  const products: ProductSeed[] = [];
  const template = categoryTemplates.food;
  const subcategoryKeys = Object.keys(template.subcategories) as Array<keyof typeof template.subcategories>;
  const productsPerSubcategory = Math.floor(count / subcategoryKeys.length);

  for (const subcategoryKey of subcategoryKeys) {
    const subcategory = template.subcategories[subcategoryKey];
    const subcategoryCount = subcategoryKey === subcategoryKeys[subcategoryKeys.length - 1]
      ? count - (products.length)
      : productsPerSubcategory;

    for (let i = 0; i < subcategoryCount; i++) {
      const brand = randomChoice(template.brands);
      const productName = randomChoice(subcategory.products);
      const spec = randomChoice(subcategory.specs);
      const description = randomChoice(subcategory.descriptions);
      const price = randomInt(subcategory.priceRange.min, subcategory.priceRange.max);
      const tags = randomChoices(subcategory.tags, randomInt(2, 4));

      products.push({
        name: `${brand} ${productName} ${spec}`,
        description: description,
        price: price,
        category: '식품',
        brand: brand,
        images: [
          `https://placehold.co/800x800/png?text=${encodeURIComponent(productName)}`,
          `https://placehold.co/800x800/png?text=${encodeURIComponent(brand)}`
        ],
        stock: randomInt(50, 500),
        tags: tags,
        rating: randomFloat(3.5, 5.0),
        reviewCount: randomInt(0, 500),
        isActive: Math.random() > 0.1
      });
    }
  }

  return products;
}

function generateLivingProducts(count: number): ProductSeed[] {
  const products: ProductSeed[] = [];
  const template = categoryTemplates.living;
  const subcategoryKeys = Object.keys(template.subcategories) as Array<keyof typeof template.subcategories>;
  const productsPerSubcategory = Math.floor(count / subcategoryKeys.length);

  for (const subcategoryKey of subcategoryKeys) {
    const subcategory = template.subcategories[subcategoryKey];
    const subcategoryCount = subcategoryKey === subcategoryKeys[subcategoryKeys.length - 1]
      ? count - (products.length)
      : productsPerSubcategory;

    for (let i = 0; i < subcategoryCount; i++) {
      const brand = randomChoice(template.brands);
      const productName = randomChoice(subcategory.products);
      const spec = randomChoice(subcategory.specs);
      const description = randomChoice(subcategory.descriptions);
      const price = randomInt(subcategory.priceRange.min, subcategory.priceRange.max);
      const tags = randomChoices(subcategory.tags, randomInt(2, 4));

      products.push({
        name: `${brand} ${productName} ${spec}`,
        description: description,
        price: price,
        category: '생활용품',
        brand: brand,
        images: [
          `https://placehold.co/800x800/png?text=${encodeURIComponent(productName)}`,
          `https://placehold.co/800x800/png?text=${encodeURIComponent(brand)}`
        ],
        stock: randomInt(20, 200),
        tags: tags,
        rating: randomFloat(3.5, 5.0),
        reviewCount: randomInt(0, 600),
        isActive: Math.random() > 0.1
      });
    }
  }

  return products;
}

function generateBookProducts(count: number): ProductSeed[] {
  const products: ProductSeed[] = [];
  const template = categoryTemplates.book;
  const subcategoryKeys = Object.keys(template.subcategories) as Array<keyof typeof template.subcategories>;
  const productsPerSubcategory = Math.floor(count / subcategoryKeys.length);

  for (const subcategoryKey of subcategoryKeys) {
    const subcategory = template.subcategories[subcategoryKey];
    const subcategoryCount = subcategoryKey === subcategoryKeys[subcategoryKeys.length - 1]
      ? count - (products.length)
      : productsPerSubcategory;

    for (let i = 0; i < subcategoryCount; i++) {
      const brand = randomChoice(template.brands);
      const productName = randomChoice(subcategory.products);
      const spec = randomChoice(subcategory.specs);
      const description = randomChoice(subcategory.descriptions);
      const price = randomInt(subcategory.priceRange.min, subcategory.priceRange.max);
      const tags = randomChoices(subcategory.tags, randomInt(2, 4));

      products.push({
        name: `${productName} - ${brand} ${spec}`,
        description: description,
        price: price,
        category: '도서',
        brand: brand,
        images: [
          `https://placehold.co/600x900/png?text=${encodeURIComponent(productName)}`,
          `https://placehold.co/600x900/png?text=${encodeURIComponent(brand)}`
        ],
        stock: randomInt(10, 100),
        tags: tags,
        rating: randomFloat(3.5, 5.0),
        reviewCount: randomInt(0, 300),
        isActive: Math.random() > 0.1
      });
    }
  }

  return products;
}

// 메인 함수
async function main() {
  const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
  const client = new Client({
    node: elasticsearchNode,
    requestTimeout: 60000,
    pingTimeout: 30000
  });

  console.log('🌱 Starting data seeding...');
  console.log(`📍 Elasticsearch: ${elasticsearchNode}`);

  // 인덱스 존재 여부 확인 및 생성
  try {
    const indexExists = await client.indices.exists({ index: 'products' });

    if (!indexExists) {
      console.log('📝 Creating products index...');
      await client.indices.create({
        index: 'products',
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          },
          mappings: {
            properties: {
              name: { type: 'text' },
              description: { type: 'text' },
              price: { type: 'long' },
              category: { type: 'keyword' },
              brand: { type: 'keyword' },
              images: { type: 'keyword' },
              stock: { type: 'integer' },
              tags: { type: 'keyword' },
              rating: { type: 'float' },
              reviewCount: { type: 'integer' },
              isActive: { type: 'boolean' }
            }
          }
        }
      });
      console.log('✅ Index created successfully');

      // 인덱스 준비 대기 (health 체크)
      console.log('⏳ Waiting for index to be ready...');
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        try {
          const health = await client.cluster.health({ index: 'products', wait_for_status: 'yellow', timeout: '5s' });
          if (health.status === 'green' || health.status === 'yellow') {
            console.log(`✅ Index is ready (status: ${health.status})`);
            break;
          }
        } catch (error) {
          // 계속 시도
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (attempts >= maxAttempts) {
        console.error('❌ Index did not become ready in time');
        process.exit(1);
      }
    } else {
      console.log('✅ Index already exists');
    }
  } catch (error) {
    console.error('❌ Failed to check/create index:', error);
    process.exit(1);
  }

  const startTime = Date.now();

  // 1000개 상품 생성
  const products = [
    ...generateElectronicsProducts(300),
    ...generateFashionProducts(250),
    ...generateFoodProducts(200),
    ...generateLivingProducts(150),
    ...generateBookProducts(100),
  ];

  console.log(`📦 Generated ${products.length} products`);

  // Bulk indexing
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i += 100) {
    const batch = products.slice(i, Math.min(i + 100, products.length));
    const body = batch.flatMap(doc => [
      { index: { _index: 'products' } },
      doc
    ]);

    try {
      const response = await client.bulk({ body });

      if (response.errors) {
        const errorItems = response.items.filter(item => item.index?.error);
        const errorCount = errorItems.length;
        failCount += errorCount;
        successCount += batch.length - errorCount;
        console.log(`⚠️  Batch ${Math.floor(i / 100) + 1}: ${batch.length - errorCount} succeeded, ${errorCount} failed`);

        // 첫 번째 에러 상세 출력
        if (errorItems.length > 0 && errorItems[0].index?.error) {
          console.log(`   Error sample:`, JSON.stringify(errorItems[0].index.error, null, 2));
        }
      } else {
        successCount += batch.length;
        console.log(`✅ Batch ${Math.floor(i / 100) + 1}: ${batch.length} products indexed`);
      }
    } catch (error) {
      failCount += batch.length;
      console.error(`❌ Batch ${Math.floor(i / 100) + 1} failed:`, error);
    }

    // 진행률 표시
    const progress = Math.min(i + 100, products.length);
    const percentage = ((progress / products.length) * 100).toFixed(1);
    console.log(`📊 Progress: ${progress}/${products.length} (${percentage}%)`);
  }

  // 인덱스 refresh
  try {
    await client.indices.refresh({ index: 'products' });
    console.log('🔄 Index refreshed');
  } catch (error) {
    console.error('❌ Failed to refresh index:', error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n✅ Seeding complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Total: ${products.length} products`);
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Failed: ${failCount}`);
  console.log(`   - Duration: ${duration}s`);
  console.log('\n📋 Category breakdown:');
  console.log('   - 전자제품: 300');
  console.log('   - 패션: 250');
  console.log('   - 식품: 200');
  console.log('   - 생활용품: 150');
  console.log('   - 도서: 100');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
