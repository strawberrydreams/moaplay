/**
 * User API 타입 정의
 * 사용자 관련 CRUD 및 인증 API 타입
 * Base URL: /api/users
 */

/**
 * 역할 정의:
 * - user: 일반 사용자 (기본값)
 * - admin: 관리자
 * - host: 주최자 (인증 승인 시 역할 변경)
 */
export type UserRole = 'user' | 'admin' | 'host';

/**
 * User API - 회원가입 요청
 * POST /api/users/ 요청 바디
 * 
 * 유효성 검증 규칙:
 * - user_id: 4-50자, 영문+숫자+언더스코어 (^[a-zA-Z0-9_]{4,50}$)
 * - password: 최소 8자 이상
 * - nickname: 2-100자
 * - email: 이메일 형식, 최대 255자
 * - real_name: 실명 (선택)
 * - phone_number: 전화번호 (선택)
 * - preferred_tags: 선호 태그 목록 (최소 3개)
 */
export interface UserSignupRequest {
  user_id: string;
  password: string;
  nickname: string;
  email: string;
  real_name?: string;
  phone_number?: string;
  preferred_tags?: string[];
}

/**
 * User API - 회원가입 응답
 * POST /api/users/ 응답 타입 (201 Created)
 */
export interface UserSignupResponse {
  id: number;
  user_id: string;
  nickname: string;
  email: string;
  role: UserRole;
  created_at: string;
}

/**
 * User API - 내 정보 조회 응답
 * GET /api/users/me 응답 타입 (200 OK)
 * 
 * 본인 정보 조회 시 민감한 정보 포함
 */
export interface UserMeResponse {
  preferred_tags: never[];
  id: number;
  user_id: string;
  nickname: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  statistics: UserStatistics;
}

/**
 * User API - 사용자 정보 조회 응답
 * GET /api/users/{id} 응답 타입 (200 OK)
 * 
 * 다른 사용자 정보 조회 시 공개 정보만 포함
 */
export interface UserPublicResponse {
  id: number;
  user_id: string;
  nickname: string;
  profile_image: string | null;
  role: UserRole;
  created_at: string;
  statistics: UserPublicStatistics;
}

/**
 * User API - 사용자 통계 정보 (본인 조회 시)
 */
export interface UserStatistics {
  events_count: number;
  favorites: number;
  reviews: number;
}

/**
 * User API - 사용자 통계 정보 (다른 사용자 조회 시)
 */
export interface UserPublicStatistics {
  events_count: number;
  reviews: number;
}

/**
 * User API - 내 정보 수정 요청
 * PUT /api/users/me 요청 바디
 * 
 * 모든 필드 선택적
 * user_id, password, role은 수정 불가
 */
export interface UserUpdateRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
}

/**
 * User API - 내 정보 수정 응답
 * PUT /api/users/me 응답 타입 (200 OK)
 */
export interface UserUpdateResponse {
  preferred_tags: any[];
  id: number;
  user_id: string;
  nickname: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  role: UserRole;
  updated_at: string;
}

/**
 * User API - 비밀번호 변경 요청
 * PUT /api/users/me/password 요청 바디
 * 
 * 필드 검증:
 * - password: 현재 비밀번호 (확인용)
 * - new_password: 새 비밀번호 (최소 8자 이상)
 */
export interface PasswordChangeRequest {
  password: string;
  new_password: string;
}

/**
 * User API - 비밀번호 변경 응답
 * PUT /api/users/me/password 응답 타입 (200 OK)
 */
export interface PasswordChangeResponse {
  message: string;
}

/**
 * User API - 회원 탈퇴 요청
 * DELETE /api/users/me 요청 바디
 * 
 * 필드 검증:
 * - password: 비밀번호 확인
 * - confirm: 탈퇴 확인 (true여야 함)
 */
export interface UserDeleteRequest {
  password: string;
  confirm: boolean;
}

/**
 * User API - 회원 탈퇴 응답
 * DELETE /api/users/me 응답 타입 (200 OK)
 */
export interface UserDeleteResponse {
  message: string;
}

/**
 * User API - 중복 확인 쿼리 파라미터
 * GET /api/users/check 쿼리 파라미터
 * 
 * type: 'user_id' | 'nickname' | 'email'
 * value: 확인할 값
 */
export interface UserCheckParams {
  type: 'user_id' | 'nickname' | 'email';
  value: string;
}

/**
 * User API - 중복 확인 응답
 * GET /api/users/check 응답 타입 (200 OK)
 * 
 * available: true (사용 가능), false (중복)
 */
export interface UserCheckResponse {
  available: boolean;
  message: string;
}