/**
 * 차트 헬퍼 유틸리티 함수
 */

/**
 * 파이 차트 라벨 포맷팅
 * @param entry 차트 엔트리 { name: string, percent: number }
 * @returns 포맷된 라벨 문자열
 */
export const formatPieChartLabel = (entry: { name: string; percent: number }): string => {
  const percentage = (entry.percent * 100).toFixed(0);
  return `${entry.name} ${percentage}%`;
};

/**
 * 숫자를 천단위 구분자로 포맷팅
 * @param value 숫자 값
 * @returns 포맷된 문자열
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('ko-KR');
};
