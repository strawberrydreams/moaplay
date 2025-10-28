/**
 * 태그 데이터 노멀라이저
 * 
 * 백엔드 Tag API 응답을 프론트엔드 UI에서 사용하기 좋은 ViewModel로 변환합니다.
 * 태그 정보, 인기도, 관련 행사 수 등을 UI 친화적인 형태로 정규화합니다.
 */

/**
 * 태그 카드 ViewModel
 * 태그 선택, 필터링 등에서 사용
 */
export interface TagCardViewModel {
  id: number;
  name: string;
  displayName: string;
  eventCount: number;
  displayEventCount: string;
  isPopular: boolean;
}

/**
 * 태그 상세 ViewModel
 */
export interface TagDetailViewModel {
  id: number;
  name: string;
  displayName: string;
  eventCount: number;
  createdAt: Date;
  displayCreatedAt: string;
  relatedTags: string[];
  recentEvents: Array<{
    id: number;
    title: string;
    startDate: Date;
    displayDate: string;
  }>;
}