import axiosInstance from './core/axios';
import type { Review, GetMyReviewResponse, GetReviewApiResponse, CreateReviewPayload, UpdateReviewPayload } from '../types/reviews';

// (GET) 특정 행사의 리뷰 목록 조회
export const getReviews = async (params: {
    event_id: number;
    page?: number;
    limit?: number;
}): Promise<GetReviewApiResponse['data']> => {
    const { data } = await axiosInstance.get<{reviews: Review[]}>('/reviews', { params });
    return data;
};

// (GET) 특정 ID의 리뷰 상세 정보 조회
export const getReviewById = async (id: number): Promise<Review> => {
    const { data } = await axiosInstance.get<Review>(`/reviews/${id}`);
    return data;
};

// (POST) 새로운 리뷰 등록
export const createReview = async (payload: CreateReviewPayload): Promise<Review> => {
    const { data } = await axiosInstance.post<Review>('/reviews', payload);
    return data;
};

// (PUT) 특정 ID의 리뷰 수정
export const updateReview = async (id: number, payload: UpdateReviewPayload): Promise<Review> => {
    const { data } = await axiosInstance.put<Review>(`/reviews/${id}`, payload);
    return data;
};

// (DELETE) 특정 ID의 리뷰 삭제
export const deleteReview = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/reviews/${id}`);
};

// (GET) 특정 유저의 리뷰 목록 조회
export const getReviewByUser = async (
  params?: { page?: number; per_page?: number; user_Id: number }
): Promise<GetMyReviewResponse> => {
  const { data } = await axiosInstance.get<GetMyReviewResponse>(`/reviews/user/${params?.user_Id}`, {
    params,
  });
  return data;
}


// (GET) 내가 쓴 리뷰 목록 조회 API
export const getMyReview = async (
  params?: { page?: number; per_page?: number }
): Promise<GetMyReviewResponse> => {
  const { data } = await axiosInstance.get<GetMyReviewResponse>('/reviews/me', {
    params,
  });
  return data;
};