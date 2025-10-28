/**
 * 행사 관련 API 서비스
 * 
 * 행사 CRUD, 검색, 승인/거절, 조회수 관리 등의 API 호출을 담당합니다.
 * 
 * API 문서: docs/api/Event API 문서.md
 */

import { apiClient } from './core/axios';
import { 
  EventDetailResponse, 
  EventCreateRequest,
  EventUpdateRequest,
  EventFilterParams,
  EventListItem
} from '../types/events';
import { PaginationInfo } from '../types';

/**
 * 검색 정보 타입
 */
export interface SearchInfo {
  query?: string;
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * 행사 목록 응답 타입
 * API 명세 준수: 래퍼 없이 직접 반환
 */
export interface EventListResponse {
  events: EventListItem[];
  pagination: PaginationInfo;
  search_info?: SearchInfo; // 검색 시 추가 정보
}

/**
 * 행사 관련 API 서비스 클래스
 * 
 * Event API 엔드포인트와 매핑되는 메서드를 제공합니다.
 * 모든 메서드는 적절한 에러 처리와 타입 안전성을 보장합니다.
 * 
 * API 명세: docs/api/Event API 문서.md
 * Requirements: 4.1, 4.2
 */
export class EventService {
  /**
   * 행사 목록 조회
   * GET /api/events
   * 
   * 필터링, 정렬, 페이지네이션을 지원하는 행사 목록을 조회합니다.
   * API 명세에 따라 응답은 {events: [...], pagination: {...}} 형식으로 직접 반환됩니다.
   * 
   * @param params 검색 및 필터 파라미터
   * @returns 행사 목록과 페이지네이션 정보
   */
  static async getEvents(params?: EventFilterParams): Promise<EventListResponse> {
    const response = await apiClient.get<EventListResponse>('/api/events', { params });
    // API 명세 준수: 래퍼 없이 직접 반환되므로 response.data를 그대로 사용
    return response.data;
  }

  /**
   * 행사 상세 조회
   * GET /api/events/{id}
   * 
   * 특정 행사의 상세 정보를 조회합니다.
   * 조회 시 view_count가 자동으로 1 증가합니다.
   * API 명세에 따라 응답은 행사 객체를 직접 반환합니다 (래퍼 없음).
   * 
   * 권한별 접근 제어:
   * - approved: 전체 공개
   * - pending, rejected: 작성자·관리자만 접근 가능
   * 
   * @param id 행사 ID
   * @returns 행사 상세 정보
   * @throws {Error} 404 - 행사를 찾을 수 없습니다
   * @throws {Error} 403 - 접근 권한이 없습니다
   */
  static async getEvent(id: number): Promise<EventDetailResponse> {
    const response = await apiClient.get<EventDetailResponse>(`/api/events/${id}`);
    // API 명세 준수: 행사 객체 직접 반환 (래퍼 없음)
    return response.data;
  }

  /**
   * 행사 신청
   * POST /api/events
   * 
   * 새로운 행사를 신청합니다.
   * Host 권한이 있는 사용자만 가능하며, 등록 시 status는 자동으로 'pending'이 됩니다.
   * API 명세에 따라 응답은 생성된 행사 객체를 직접 반환합니다 (래퍼 없음).
   * 
   * 이미지는 별도의 Upload API를 통해 먼저 업로드하고, URL을 image_urls에 포함시켜야 합니다.
   * 
   * @param data 행사 생성 데이터 (image_urls 포함)
   * @returns 생성된 행사 정보
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - Host 권한이 필요합니다
   * @throws {Error} 422 - 입력값이 유효하지 않습니다
   */
  static async createEvent(data: EventCreateRequest): Promise<EventDetailResponse> {
    const response = await apiClient.post<EventDetailResponse>('/api/events', data);
    return response.data;
  }

  /**
   * 행사 수정
   * PUT /api/events/{id}
   * 
   * 행사 정보를 수정합니다.
   * 작성자만 수정 가능하며, pending/rejected 상태에서 수정 시 pending으로 변경됩니다.
   * approved 상태에서 수정 시 일정 등록자에게 알림이 발송됩니다 (30분 쿨다운).
   * API 명세에 따라 응답은 수정된 행사 객체를 직접 반환합니다 (래퍼 없음).
   * 
   * 새 이미지는 별도의 Upload API를 통해 먼저 업로드하고, URL을 image_urls에 포함시켜야 합니다.
   * 
   * @param id 행사 ID
   * @param data 수정할 데이터 (선택적 필드, image_urls 포함)
   * @returns 수정된 행사 정보
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 수정 권한이 없습니다
   * @throws {Error} 404 - 행사를 찾을 수 없습니다
   * @throws {Error} 422 - 입력값이 유효하지 않습니다
   */
  static async updateEvent(id: number, data: EventUpdateRequest): Promise<EventDetailResponse> {
    const response = await apiClient.put<EventDetailResponse>(`/api/events/${id}`, data);
    return response.data;
  }

  /**
   * 행사 삭제
   * DELETE /api/events/{id}
   * 
   * 행사를 삭제합니다.
   * 작성자 또는 관리자만 삭제 가능하며, 연관된 리뷰, 일정, 찜도 함께 삭제됩니다 (CASCADE).
   * API 명세에 따라 응답은 삭제 성공 메시지를 직접 반환합니다 (래퍼 없음).
   * 
   * @param id 행사 ID
   * @returns 삭제 성공 메시지
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 삭제 권한이 없습니다
   * @throws {Error} 404 - 행사를 찾을 수 없습니다
   */
  static async deleteEvent(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/events/${id}`);
    // API 명세 준수: 메시지 직접 반환 (래퍼 없음)
    return response.data;
  }
  /**
   * 행사 상세 조회 (별칭)
   * getEvent()와 동일한 기능
   */
  static async getEventDetail(id: number): Promise<EventDetailResponse> {
    return this.getEvent(id);
  }
}

/**
 * 행사 생성 요청 타입 (별칭)
 */
export type CreateEventRequest = EventCreateRequest;