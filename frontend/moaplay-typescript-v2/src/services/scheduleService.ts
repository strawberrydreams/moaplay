/**
 * 개인 일정 관리 서비스
 *
 * 사용자의 개인 일정 추가/삭제, 목록 조회 등의 API 호출을 담당합니다.
 *
 * API 문서: docs/api/Schedule API 문서.md
 * Base URL: /api/schedules
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

import { apiClient } from './core/axios';
import {
  ScheduleCreateRequest,
  ScheduleCreateResponse,
  ScheduleListParams,
  ScheduleListResponse,
  ScheduleDeleteResponse
} from '../types/schedules';

/**
 * 개인 일정 관리 서비스 클래스
 *
 * Schedule API 엔드포인트와 매핑되는 메서드를 제공합니다.
 * 모든 메서드는 적절한 에러 처리와 타입 안전성을 보장합니다.
 * 
 * API 명세: docs/api/Schedule API 문서.md
 * Requirements: 2.7
 * 
 * 참고: 백엔드 API 구현 후 실제 연동 필요
 */

export class ScheduleService {
  /**
   * 일정 추가
   * POST /api/schedules/
   *
   * 행사를 개인 일정에 추가합니다.
   * 
   * 비즈니스 로직:
   * - 로그인한 사용자만 가능
   * - approved 상태의 행사만 추가 가능
   * - 동일 행사 중복 추가 불가
   * - 추가 시 schedules_count 증가
   *
   * @param data 일정 추가 데이터 (event_id)
   * @returns 추가된 개인 일정 정보
   * @throws {Error} 400 - 필수 필드 누락
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 승인된 행사만 일정에 추가할 수 있습니다
   * @throws {Error} 404 - 행사를 찾을 수 없습니다
   * @throws {Error} 409 - 이미 일정에 추가된 행사입니다
   */
  static async addSchedule(data: ScheduleCreateRequest): Promise<ScheduleCreateResponse> {
    const response = await apiClient.post<ScheduleCreateResponse>('/api/schedules/', data);
    return response.data;
  }

  /**
   * 내 일정 목록 조회
   * GET /api/schedules/
   *
   * 본인의 일정 목록을 조회합니다.
   * 행사 시작일 기준 오름차순으로 정렬됩니다.
   * 
   * 필터링 규칙:
   * - 파라미터 없음: 전체 일정 조회
   * - date: 특정 날짜에 진행 중인 행사 (start_date <= date <= end_date)
   * - year+month: 특정 월에 겹치는 행사
   *
   * @param params 조회 파라미터 (선택적)
   * @returns 개인 일정 목록
   * @throws {Error} 400 - 날짜 형식 오류
   * @throws {Error} 401 - 로그인이 필요합니다
   */
  static async getSchedules(params?: ScheduleListParams): Promise<ScheduleListResponse> {
    try {
      console.log('Fetching schedules with params:', params);
      const response = await apiClient.get<ScheduleListResponse>('/api/schedules/', { params });
      console.log('Schedule API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      throw error;
    }
  }

  /**
   * 일정 삭제
   * DELETE /api/schedules/{id}
   *
   * 개인 일정에서 행사를 제거합니다.
   * 본인의 일정만 삭제 가능하며, 삭제 시 schedules_count가 감소합니다.
   *
   * @param id 삭제할 개인 일정 ID
   * @returns 삭제 성공 메시지
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 본인의 일정만 삭제할 수 있습니다
   * @throws {Error} 404 - 일정을 찾을 수 없습니다
   */
  static async removeSchedule(id: number): Promise<ScheduleDeleteResponse> {
    const response = await apiClient.delete<ScheduleDeleteResponse>(`/api/schedules/${id}`);
    return response.data;
  }
  /**
   * 일정 토글 (추가/삭제)
   * 
   * 행사가 일정에 있으면 삭제하고, 없으면 추가합니다.
   *
   * @param eventId 행사 ID
   * @param scheduleId 일정 ID (있는 경우)
   * @returns 토글 결과 (action: 'added' | 'removed', scheduleId: number | null)
   */
  static async toggleSchedule(eventId: number, scheduleId?: number): Promise<{ action: 'added' | 'removed'; scheduleId: number | null }> {
    if (scheduleId) {
      // 이미 일정에 추가된 경우 → 삭제
      await this.removeSchedule(scheduleId);
      return { action: 'removed', scheduleId: null };
    } else {
      // 일정에 없는 경우 → 추가
      const schedule = await this.addSchedule({ event_id: eventId });
      return { action: 'added', scheduleId: schedule.id };
    }
  }
}