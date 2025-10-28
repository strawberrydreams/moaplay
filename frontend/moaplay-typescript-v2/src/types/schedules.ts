/**
 * Schedule API 타입 정의
 * 
 * 개인 일정 관리 기능 API 타입을 정의합니다.
 * 
 * API 문서: docs/api/Schedule API 문서.md
 * Base URL: /api/schedules
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

/**
 * Schedule API - 일정 추가 요청
 * POST /api/schedules/ 요청 바디
 * 
 * 비즈니스 로직:
 * - 로그인한 사용자만 가능
 * - approved 상태의 행사만 추가 가능
 * - 동일 행사 중복 추가 불가
 * - 추가 시 schedules_count 증가
 */
export interface ScheduleCreateRequest {
  event_id: number;
}

/**
 * Schedule API - 일정 추가 응답
 * POST /api/schedules/ 응답 타입 (201 Created)
 */
export interface ScheduleCreateResponse {
  id: number;
  user: ScheduleUserInfo;
  event: ScheduleEventInfo;
  created_at: string;
}

/**
 * Schedule API - 일정 목록 조회 쿼리 파라미터
 * GET /api/schedules/ 쿼리 파라미터
 * 
 * 필터링 규칙:
 * - 없음: 전체 일정 조회
 * - date: 특정 날짜에 진행 중인 행사 (start_date <= date <= end_date)
 * - year+month: 특정 월에 겹치는 행사
 */
export interface ScheduleListParams {
  date?: string; // YYYY-MM-DD
  year?: number;
  month?: number; // 1-12
}

/**
 * Schedule API - 일정 목록 조회 응답
 * GET /api/schedules/ 응답 타입 (200 OK)
 */
export interface ScheduleListResponse {
  schedules: ScheduleListItem[];
  total: number;
}

/**
 * Schedule API - 일정 목록 아이템
 */
export interface ScheduleListItem {
  id: number;
  user: ScheduleUserInfo;
  event: ScheduleEventInfo;
  created_at: string;
}

/**
 * Schedule API - 일정의 사용자 정보
 */
export interface ScheduleUserInfo {
  id: number;
  nickname: string;
  profile_image: string | null;
}

/**
 * Schedule API - 일정의 행사 정보
 */
export interface ScheduleEventInfo {
  id: number;
  title: string;
  summary: string | null;
  start_date: string;
  end_date: string;
  location: string;
  image_urls: string[];
  status: 'approved';
}

/**
 * Schedule API - 일정 삭제 응답
 * DELETE /api/schedules/{id} 응답 타입 (200 OK)
 * 
 * 비즈니스 로직:
 * - 본인 일정만 삭제 가능
 * - 삭제 시 schedules_count 감소
 */
export interface ScheduleDeleteResponse {
  message: string;
}