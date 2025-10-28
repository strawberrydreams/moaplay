/**
 * Tag API 타입 정의
 * 행사 태그 관련 기능 API 타입
 * Base URL: /api/tags
 */

/**
 * Tag API - 태그 생성 응답
 * POST /api/tags/ 응답 타입 (201 Created)
 */
export interface TagCreateResponse {
  id: number;
  name: string;
  created_at: string;
}

/**
 * Tag API - 태그 목록 조회 쿼리 파라미터 (향후 구현 예정)
 * GET /api/tags 쿼리 파라미터
 */
export interface TagListParams {
  page?: number;
  limit?: number;
  sort?: 'popular' | 'recent' | 'name';
}

/**
 * Tag API - 태그 목록 조회 응답 (향후 구현 예정)
 * GET /api/tags 응답 타입 (200 OK)
 */
export interface TagListResponse {
  tags: TagListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Tag API - 태그 목록 아이템 (향후 구현 예정)
 */
export interface TagListItem {
  id: number;
  name: string;
  event_count: number;
  created_at: string;
}

/**
 * Tag API - 태그 상세 조회 응답 (향후 구현 예정)
 * GET /api/tags/{id} 응답 타입 (200 OK)
 */
export interface TagDetailResponse {
  id: number;
  name: string;
  event_count: number;
  created_at: string;
  related_tags: string[];
  recent_events: TagRecentEvent[];
}

/**
 * Tag API - 태그의 최근 행사 정보 (향후 구현 예정)
 */
export interface TagRecentEvent {
  id: number;
  title: string;
  start_date: string;
}
/**
 * Tag API - 인기 태그 아이템 (향후 구현 예정)
 */
export interface TagPopularItem {
  id: number;
  name: string;
  event_count: number;
}