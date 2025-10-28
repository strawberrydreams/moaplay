/**
 * Favorite API 타입 정의
 * 
 * 행사 찜하기 기능 API 타입을 정의합니다.
 * 
 * API 문서: docs/api/Favorite API 문서.md
 * Base URL: /api/favorites
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

/**
 * Favorite API - 찜 추가 요청
 * POST /api/favorites/ 요청 바디
 * 
 * 비즈니스 로직:
 * - 로그인한 사용자만 가능
 * - approved 상태의 행사만 찜 가능
 * - 동일 행사 중복 찜 불가
 */
export interface FavoriteCreateRequest {
  event_id: number;
}

/**
 * Favorite API - 찜 추가 응답
 * POST /api/favorites/ 응답 타입 (201 Created)
 */
export interface FavoriteCreateResponse {
  id: number;
  user: FavoriteUserInfo;
  event: FavoriteEventInfo;
  created_at: string;
}

/**
 * Favorite API - 찜 목록 조회 쿼리 파라미터
 * GET /api/favorites/ 쿼리 파라미터
 */
export interface FavoriteListParams {
  page?: number;
  per_page?: number;
}

/**
 * Favorite API - 찜 목록 조회 응답
 * GET /api/favorites/ 응답 타입 (200 OK)
 */
export interface FavoriteListResponse {
  favorites: FavoriteListItem[];
  pagination: FavoritePaginationInfo;
}

/**
 * Favorite API - 찜 목록 아이템
 */
export interface FavoriteListItem {
  id: number;
  user: FavoriteUserInfo;
  event: FavoriteEventInfo;
  created_at: string;
}

/**
 * Favorite API - 찜의 사용자 정보
 */
export interface FavoriteUserInfo {
  id: number;
  nickname: string;
  profile_image: string | null;
}

/**
 * Favorite API - 찜의 행사 정보
 */
export interface FavoriteEventInfo {
  id: number;
  title: string;
  summary: string | null;
  start_date: string;
  end_date: string;
  location: string;
  image_urls: string[];
  status: 'approved';
  average_rating: number;
}

/**
 * Favorite API - 페이지네이션 정보
 */
export interface FavoritePaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

/**
 * Favorite API - 찜 삭제 응답
 * DELETE /api/favorites/{id} 응답 타입 (200 OK)
 */
export interface FavoriteDeleteResponse {
  message: string;
}