/**
 * Review API 타입 정의
 * 
 * 행사 리뷰 작성 및 관리 기능 API 타입을 정의합니다.
 * 
 * API 문서: docs/api/Review API 문서.md
 * Base URL: /api/reviews
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

/**
 * Review API - 리뷰 작성 요청
 * POST /api/reviews/ 요청 바디
 * 
 * 필드 제약:
 * - title: 최대 255자
 * - content: Text
 * - rating: 1-5 (정수)
 * - image_urls: URL 배열
 * 
 * 비즈니스 로직:
 * - 로그인한 사용자만 가능
 * - approved 상태의 행사만 리뷰 작성 가능
 */
export interface ReviewCreateRequest {
  event_id: number;
  title: string;
  content: string;
  rating: number; // 1-5
  image_urls?: string[];
}

/**
 * Review API - 리뷰 작성 응답
 * POST /api/reviews/ 응답 타입 (201 Created)
 */
export interface ReviewCreateResponse {
  id: number;
  title: string;
  content: string;
  rating: number;
  image_urls: string[];
  user: ReviewUserInfo;
  event: ReviewEventInfo;
  created_at: string;
  updated_at: string;
}

/**
 * Review API - 리뷰 수정 요청
 * PUT /api/reviews/{id} 요청 바디
 * 
 * 모든 필드 선택적
 * 본인이 작성한 리뷰만 수정 가능
 */
export interface ReviewUpdateRequest {
  title?: string;
  content?: string;
  rating?: number; // 1-5
  image_urls?: string[];
}

/**
 * Review API - 리뷰 수정 응답
 * PUT /api/reviews/{id} 응답 타입 (200 OK)
 */
export interface ReviewUpdateResponse {
  id: number;
  title: string;
  content: string;
  rating: number;
  image_urls: string[];
  user: ReviewUserInfo;
  event: ReviewEventInfo;
  created_at: string;
  updated_at: string;
}

/**
 * Review API - 리뷰 상세 조회 응답
 * GET /api/reviews/{id} 응답 타입 (200 OK)
 */
export interface ReviewDetailResponse {
  id: number;
  title: string;
  content: string;
  rating: number;
  image_urls: string[];
  user: ReviewUserInfo;
  event: ReviewEventInfo;
  created_at: string;
  updated_at: string;
}

/**
 * Review API - 행사별 리뷰 목록 조회 쿼리 파라미터
 * GET /api/reviews 쿼리 파라미터
 */
export interface ReviewListParams {
  event_id: number; // 필수
  page?: number;
  per_page?: number;
}

/**
 * Review API - 행사별 리뷰 목록 조회 응답
 * GET /api/reviews 응답 타입 (200 OK)
 */
export interface ReviewListResponse {
  reviews: ReviewListItem[];
  pagination: ReviewPaginationInfo;
}

/**
 * Review API - 리뷰 목록 아이템
 */
export interface ReviewListItem {
  id: number;
  title: string;
  content: string;
  rating: number;
  image_urls: string[];
  user: ReviewUserInfo;
  event: ReviewEventInfo;
  created_at: string;
  updated_at: string;
}

/**
 * Review API - 리뷰 작성자 정보
 */
export interface ReviewUserInfo {
  id: number;
  nickname: string;
  profile_image: string | null;
}

/**
 * Review API - 리뷰 대상 행사 정보
 */
export interface ReviewEventInfo {
  id: number;
  title: string;
}

/**
 * Review API - 페이지네이션 정보
 */
export interface ReviewPaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

/**
 * Review API - 리뷰 삭제 응답
 * DELETE /api/reviews/{id} 응답 타입 (200 OK)
 * 
 * 본인이 작성한 리뷰 또는 관리자만 삭제 가능
 */
export interface ReviewDeleteResponse {
  message: string;
}