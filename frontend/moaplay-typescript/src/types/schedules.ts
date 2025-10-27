import * as E from './events';

// =================================================================
// == Response (응답) 타입들
// =================================================================

// 내 일정 목록에 포함된 행사 정보
// API: GET /api/schedules (목록 조회의 event 객체)
export interface ScheduleEventInfo {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    main_image: string;
}

// 내 일정 정보 타입
// API: GET /api/schedules (목록 조회의 각 항목)
export interface Schedule {
  id: number;          // 찜 항목 자체의 ID
  user: {
    id: number;
    nickname: string;
    profile_image: string | null;
  }
  created_at: string;  // 찜한 날짜 (ISO 문자열)
  event: E.Event | null; // 연결된 행사 정보 (E.Event 타입 사용, 없을 수도 있음)
  // schedule.to_dict()가 반환하는 다른 필드가 있다면 추가
}

// 전체 API 응답 (GET /api/schedules/)의 타입 정의
export interface SchedulesResponse {
  schedules: Schedule[]; // Schedule 객체의 배열
  total: number;       // 조회된 찜 항목의 총 개수
}

// 일정 추가 후 응답 타입
// API: POST /api/schedule (생성 후 응답)
export interface ScheduleCreationResponse {
    id: number;
    user_id: number;
    event_id: number;
    created_at: string;
}

// ===============================================================
// == Request (요청) 타입들
// ===============================================================

// 일정 추가를 위한 데이터 타입
// API: POST /api/schedule (생성 요청 Body)
export interface CreateSchedulePayload {
    event_id: number;
}
