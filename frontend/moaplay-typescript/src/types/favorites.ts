// =================================================================
// == Response (응답) 타입들
// =================================================================

// 찜 목록 아이템 타입
// API: GET /api/favorites (목록 조회의 각 항목)
export interface Favorite {
    id: number;
    user_id: number;
    event_id: number;
    created_at: string;
}

export interface FavoriteStatus {
    is_favorite: boolean;
    favorite_id?: number;
}

// 찜 추가 후 응답 타입
// API: POST /api/favorite (생성 후 응답)
export interface FavoriteCreationResponse {
    id: number;
    event_id: number;
}

// ===============================================================
// == Request (요청) 타입들
// ===============================================================

// 찜 추가를 위한 데이터 타입
// API: POST /api/favorite (생성 요청 Body)
export interface CreateFavoritePayload {
    favorite_id: number;
}