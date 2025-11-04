import type { UserSummary } from './';

// =================================================================
// == Response (응답) 타입들
// =================================================================

// 리뷰 상세 정보 타입 (Full Version)
// API: GET /api/review/{id} (상세 조회)
// API: POST /api/review (생성 후 응답)
// API: PUT /api/review/{id} (수정 후 응답)
export interface Review {
    id: number;
    title: string;
    content: string;
    rating: number;
    image_urls: string[];
    user: UserSummary;
    event_id: number;
    created_at: string;
    updated_at?: string;
}

// 리뷰 요약 정보 타입 (Summary Version)
// API: GET /api/reviews (목록 조회의 각 항목)
export interface ReviewSummary {
    id: number;
    title: string;
    content: string;
    user_name: string;
    user_profile_image: string;
    created_at: string;
}

export interface GetReviewApiResponse {
    data : {
        reviews: Review[];
    }
}

export interface GetMyReviewResponse {
    reviews: Review[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        pages: number;
    }
}

// ===============================================================
// == Request (요청) 타입들
// ===============================================================

// 리뷰 생성을 위한 데이터 타입
// API: POST /api/review (생성 요청 Body)
export interface CreateReviewPayload {
    title: string;
    content: string;
    rating: number;
    event_id: number;
    image_urls?: string[];
}

// 리뷰 수정을 위한 데이터 타입
// API: PUT /api/review/{id} (수정 요청 Body)
export interface UpdateReviewPayload {
    title: string;
    content: string;
    rating: number;
    image_urls?: string[];
}
