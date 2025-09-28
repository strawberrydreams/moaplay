// =================================================================
// == Response (응답) 타입들
// =================================================================

// 목록 API의 페이지네이션 정보
export interface Pagination {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
}

// 페이지네이션을 포함하는 API 응답을 위한 제네릭 타입
// T: 목록의 각 아이템 타입 (e.g., EventSummary, ReviewSummary)
// K: 목록 데이터를 담는 키 (e.g., "events", "reviews")
export type PaginatedResponse<T, K extends string> = {
    pagination: Pagination;
} & {
    [key in K]: T[];
};

// 사용자 요약 정보 (리뷰, 목록 등)
export interface UserSummary {
    id: number;
    name: string;
    profile_image: string;
}

// 행사 주최자 정보
export interface Host {
    id: number;
    name: string;
}

// API 에러 응답
export interface ApiError {
    error: string;
    code: string;
    message: string;
}
