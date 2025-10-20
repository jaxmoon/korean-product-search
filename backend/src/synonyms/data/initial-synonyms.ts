import { CreateSynonymDto } from '../dto/create-synonym.dto';

export const INITIAL_SYNONYMS: CreateSynonymDto[] = [
  {
    word: '스타벅스',
    synonyms: ['스벅', '스타벅스', '스타박스'],
    category: 'brand',
    isActive: true,
  },
  {
    word: 'LG',
    synonyms: ['엘지', 'LG', '엘쥐'],
    category: 'brand',
    isActive: true,
  },
  {
    word: '삼성',
    synonyms: ['삼성', '쌤성', '쌤숭'],
    category: 'brand',
    isActive: true,
  },
  {
    word: '애플',
    synonyms: ['애플', '아이폰회사'],
    category: 'brand',
    isActive: true,
  },
  {
    word: '갤럭시',
    synonyms: ['갤럭시', '갤럭', '갤', '겔럭시'],
    category: 'product',
    isActive: true,
  },
  {
    word: '노트북',
    synonyms: ['노트북', '랩탑', '랩톱', '노북'],
    category: 'general',
    isActive: true,
  },
  {
    word: '휴대폰',
    synonyms: ['휴대폰', '핸드폰', '폰', '스마트폰'],
    category: 'general',
    isActive: true,
  },
];
