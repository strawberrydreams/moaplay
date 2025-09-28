// =================================================================
// == Response (응답) 타입들
// =================================================================

// 찜 목록 아이템 타입
// API: GET /api/favorites (목록 조회의 각 항목)
export interface Favorite {
    id: number;
    event_id: number;
    event_title: string;
    event_date: string; // 이거 event_date 대신에 start_date & end_date 있어야 하는 자리가 아닐까?
    // start_date: string;
    // end_date: string;
    created_at: string;
}

// 찜 추가 후 응답 타입
// API: POST /api/favorite (생성 후 응답)
export interface FavoriteCreationResponse {
    id: number;
    event_id: number;
    created_at: string;
}

// ===============================================================
// == Request (요청) 타입들
// ===============================================================

// 찜 추가를 위한 데이터 타입
// API: POST /api/favorite (생성 요청 Body)
export interface CreateFavoritePayload {
    event_id: number;
}