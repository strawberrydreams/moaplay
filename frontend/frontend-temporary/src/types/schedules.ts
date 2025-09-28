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
    id: number;
    event: ScheduleEventInfo;
    created_at: string;
}

// 일정 추가 후 응답 타입
// API: POST /api/schedule (생성 후 응답)
export interface ScheduleCreationResponse {
    id: number;
    event_id: number;
    start_date: string;
    end_date: string;
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
