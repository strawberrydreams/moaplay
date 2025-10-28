/**
 * Auth API 타입 정의
 * 
 * 세션 기반 인증 API 타입을 정의합니다.
 * 
 * API 문서: docs/api/Auth API 문서.md
 * Base URL: /api/auth
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

/**
 * Auth API - 로그인 요청
 * POST /api/auth/login 요청 바디
 * 
 * 필드 검증:
 * - user_id: 4-50자, 영문+숫자+언더스코어
 * - password: 8자 이상
 */
export interface LoginRequest {
  user_id: string;
  password: string;
}

/**
 * Auth API - 로그인 응답
 * POST /api/auth/login 응답 타입 (200 OK)
 * 
 * 세션 기반 인증:
 * - 서버에서 세션 생성 후 세션 ID를 쿠키로 반환
 * - 클라이언트는 withCredentials: true 설정 필요
 * 
 * 하이브리드 인증 (선택적):
 * - access_token, refresh_token이 포함될 수 있음
 */
export interface LoginResponse {
  id: number;
  user_id: string;
  access_token?: string;
  refresh_token?: string;
}

/**
 * Auth API - 로그아웃 응답
 * POST /api/auth/logout 응답 타입 (200 OK)
 * 
 * 세션 삭제:
 * - 서버에서 세션 정보 삭제 및 쿠키 무효화
 */
export interface LogoutResponse {
  message: string;
}