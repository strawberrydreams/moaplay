/**
 * Event API 타입 정의
 * 
 * 행사 관련 CRUD 및 관리 기능 API 타입을 정의합니다.
 * 
 * API 문서: docs/api/Event API 문서.md
 * Base URL: /api/events
 * 
 * API 명세 준수: Event API는 래퍼 없이 직접 응답을 반환합니다.
 * - 목록 조회: {events: [...], pagination: {...}}
 * - 상세 조회: 행사 객체 직접 반환
 * - 생성/수정: 행사 객체 직접 반환
 * - 삭제: {message: "..."}
 */

import { PaginationInfo } from './index';

/**
 * 행사 상태 enum
 * 
 * 상태 정의:
 * - pending: 승인 대기 중
 * - approved: 승인됨 (공개)
 * - rejected: 거절됨
 */
export type EventStatus = 'pending' | 'approved' | 'rejected';

/**
 * Event API - 행사 생성 요청
 * POST /api/events/ 요청 바디
 * 
 * 필드 제약:
 * - title: 1-200자
 * - summary: 최대 200자
 * - start_date, end_date: YYYY-MM-DD 형식
 * - location: 1-255자
 * - description: Text
 * - phone: 최대 20자
 * - image_urls: URL 배열
 * - hashtag: 문자열 배열 (태그 이름)
 */
export interface EventCreateRequest {
  title: string;
  summary?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  location: string;
  description: string;
  phone: string;
  organizer?: string;
  hosted_by?: string;
  image_urls?: string[];
  hashtag?: string[]; // 태그 이름 배열
}

/**
 * Event API - 행사 수정 요청
 * PUT /api/events/{id} 요청 바디
 * 
 * 모든 필드 선택적
 * 작성자만 수정 가능
 */
export interface EventUpdateRequest {
  title?: string;
  summary?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  location?: string;
  description?: string;
  phone?: string;
  organizer?: string;
  hosted_by?: string;
  image_urls?: string[];
  tag_names?: string[];
}

/**
 * Event API - 행사 상세 정보
 * GET /api/events/{id} 응답 타입 (200 OK)
 * 
 * 행사 생성/수정 시에도 동일한 구조로 반환됨
 */
export interface EventDetailResponse {
  id: number;
  title: string;
  summary: string | null;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  phone: string;
  organizer: string | null;
  hosted_by: string | null;
  image_urls: string[];
  host: EventHostInfo;
  status: EventStatus;
  tags: string[];
  stats: EventStatsInfo;
  created_at: string;
  updated_at: string;
}

/**
 * Event API - 행사 목록 조회 응답
 * GET /api/events 응답 타입 (200 OK)
 */
export interface EventListResponse {
  events: EventListItem[];
  pagination: PaginationInfo;
}

/**
 * Event API - 행사 목록 아이템
 * GET /api/events 응답 타입의 개별 아이템
 */
export interface EventListItem {
  id: number;
  title: string;
  summary: string | null;
  start_date: string;
  location: string;
  organizer: string | null;
  image_urls: string[];
  host: EventHostInfo;
  status: EventStatus;
  tags: string[];
  stats: EventStatsInfo;
}

/**
 * Event API - 행사 통계 정보
 */
export interface EventStatsInfo {
  average_rating: number;
  total_reviews: number;
  view_count: number;
  favorites_count: number;
  schedules_count: number;
}

/**
 * Event API - 행사 주최자 정보
 */
export interface EventHostInfo {
  id: number;
  nickname: string;
}

/**
 * Event API - 행사 상태 변경 요청
 * PUT /api/events/{id}/status 요청 바디
 * 
 * 관리자만 접근 가능
 * rejection_reason은 status가 'rejected'일 때 필수
 */
export interface EventStatusUpdateRequest {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}
/**
 * Event API - 행사 검색 쿼리 파라미터
 * GET /api/events/search 쿼리 파라미터
 * 
 * 검색 조건:
 * - 제목 기준 검색
 * - 승인된 행사만 노출
 * - 대소문자 구분 없음
 */
export interface EventSearchParams {
  q: string; // 검색어
  page?: number;
  limit?: number;
}
/**
 * Event API - 행사 필터 쿼리 파라미터
 * GET /api/events 쿼리 파라미터
 */
export interface EventFilterParams {
  page?: number;
  limit?: number;
  region?: string;
  tag?: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  sort?: 'created_at' | 'start_date' | 'title' | 'view_count' | 'average_rating';
  order?: 'asc' | 'desc';
}