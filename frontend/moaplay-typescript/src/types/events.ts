// =================================================================
// == Response (응답) 타입들: 서버로부터 받는 데이터의 형태를 정의 ==
// =================================================================

// 호스트(행사 주최자) 정보 타입
// GET /api/events/{id} 응답에 포함
// POST /api/events 응답에 포함
export interface Host {
    id: number;
    name: string;
}

// 행사 상세 정보 타입 (Full Version)
// API: GET /api/events/{id} (상세 조회 응답)
// API: POST /api/events (생성 후 응답)
// API: PUT /api/events/{id} (수정 후 응답)
export interface Event {
    id: number;
    title: string;
    summary: string;
    start_date: string;
    end_date: string;
    location: string;
    description: string;
    hashtags: string[];
    phone: string;
    image_urls: string[];
    host: Host;
    status: 'pending' | 'approved' | 'modified' | 'rejected';
    created_at: string;
    updated_at?: string; // 수정 시에만 존재할 수 있으므로 optional
}

// 행사 요약 정보 타입 (Summary Version)
// API: GET /api/events (목록 조회의 각 항목 응답)
export interface EventSummary {
    id: number;
    title:string;
    start_date: string;
    end_date: string;
    location: string;
    hashtags: string[];
    main_image: string;
}

// ===============================================================
// == Request (요청) 타입들: 서버로 보내는 데이터의 형태를 정의 ==
// ===============================================================

// 행사 생성을 위한 데이터 타입 (Payload)
// API: POST /api/events (생성 요청 Body)
export interface CreateEventPayload {
    title: string;
    summary: string;
    start_date: string;
    end_date: string;
    location: string;
    description: string;
    hashtags: string[];
    phone: string;
    image_urls: string[];
}

// 행사 수정을 위한 데이터 타입 (Payload)
// API: PUT /api/events/{id} (수정 요청 Body)
// CreateEventPayload와 구조가 동일하지만, 역할 분리를 위해 별도 타입으로 선언
export type UpdateEventPayload = CreateEventPayload;

// 관리자가 행사 상태를 변경하기 위한 데이터 타입 (Payload)
// API: PUT /api/events/{id}/status (상태 변경 요청 Body)
export interface UpdateEventStatusPayload {
    status: 'approve' | 'reject';
    reason?: string; // 거절 시에만 필요한 값이므로 optional
}
