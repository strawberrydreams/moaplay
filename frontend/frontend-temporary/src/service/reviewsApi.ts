import axiosInstance from './core';
import type { PaginatedResponse } from '../types';
import type { Review, ReviewSummary, CreateReviewPayload, UpdateReviewPayload } from '../types/reviews';

type ReviewListResponse = PaginatedResponse<ReviewSummary, 'reviews'>;

// (GET) 특정 행사의 리뷰 목록 조회
export const getReviews = async (params: {
    event_id: number;
    page?: number;
    limit?: number;
}): Promise<ReviewListResponse> => {
    const { data } = await axiosInstance.get<ReviewListResponse>('/reviews', { params });
    return data;
};

// (GET) 특정 ID의 리뷰 상세 정보 조회
export const getReviewById = async (id: number): Promise<Review> => {
    const { data } = await axiosInstance.get<Review>(`/review/${id}`);
    return data;
};

// (POST) 새로운 리뷰 등록
export const createReview = async (payload: CreateReviewPayload): Promise<Review> => {
    const { data } = await axiosInstance.post<Review>('/review', payload);
    return data;
};

// (PUT) 특정 ID의 리뷰 수정
export const updateReview = async (id: number, payload: UpdateReviewPayload): Promise<Review> => {
    const { data } = await axiosInstance.put<Review>(`/review/${id}`, payload);
    return data;
};

// (DELETE) 특정 ID의 리뷰 삭제
export const deleteReview = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/review/${id}`);
};
