// =================================================================
// == Response (응답) 타입들: 서버로부터 받는 데이터의 형태를 정의 ==
// =================================================================

// 호스트(행사 주최자) 정보 타입
// GET /api/events/{id} 응답에 포함
// POST /api/events 응답에 포함
export interface Host {
    id: number;
    nickname: string;
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
    tags: string[];
    phone: string;
    image_urls: string[];
    host: Host;
    status: 'pending' | 'approved' | 'modified' | 'rejected';
    created_at: string;
    updated_at?: string; // 수정 시에만 존재할 수 있으므로 optional
    color?: string; // 프론트엔드에서 임의로 추가하는 속성
}


// ===============================================================
// == Request (요청) 타입들: 서버로 보내는 데이터의 형태를 정의 ==
// ===============================================================

// 행사 생성을 위한 데이터 타입 (Payload)
// API: POST /api/events (생성 요청 Body)
export interface CreateEventPayload {
    id?: number;
    title: string;
    summary: string;
    start_date: string;
    end_date: string;
    location: string;
    description: string;
    phone: string;
    organizer: string;
    hosted_by: Host;
    image_urls: string[];
    tag_names: string[];
}

// 행사 목록 조회를 위한 데이터 타입 (Payload)
// API: POST /api/events?page={id}&limit={limit}&region={region}&tag={tag}&date_from={date_from}&date_to={date_to}&sort={sort}
// export interface GetEventsPayload {
//     // search?: string;
//     page?: number;
//     limit?: number;
//     region?: string;
//     tag?: string[];
//     date_from?: string;
//     date_to?: string;
//     sort?: string;
//     order?: 'asc' | 'desc';
// }

export interface GetEventsPayload {
    page?: number;
    per_page?: number;
    status?: 'status' | 'approved';
    location?: string;
    sort?: 'view_count' | 'start_date';
    order?: 'asc' | 'desc';
}

// 행사 수정을 위한 데이터 타입 (Payload)
// API: PUT /api/events/{id} (수정 요청 Body)
// CreateEventPayload와 구조가 동일하지만, 역할 분리를 위해 별도 타입으로 선언
export type UpdateEventPayload = CreateEventPayload & {id: number};

// 관리자가 행사 상태를 변경하기 위한 데이터 타입 (Payload)
// API: PUT /api/events/{id}/status (상태 변경 요청 Body)
export interface UpdateEventStatusPayload {
    status: 'approve' | 'reject';
    message?: string; // 거절 시에만 필요한 값이므로 optional
}

export interface EventStatusUpdateResponse {
    id: number;
    status: 'pending' | 'approved' | 'modified' | 'rejected';
    message: string;
}

// ===============================================================
// ==Rsponse 타입들: 서버로부터 받는 데이터의 형태를 정의 ==
// ===============================================================



// 행사 리스트 조회 응답 타입 (Response)
// API: GET /api?evnets
interface EventReadListResponse {
    events: Event[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}