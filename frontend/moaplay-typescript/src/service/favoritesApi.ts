import axiosInstance from './core';
import type { Favorite, FavoriteCreationResponse, CreateFavoritePayload, FavoriteResponse, FavoriteStatus } from '../types/favorites';

// (GET) 사용자의 모든 찜 목록 조회
export const getFavorites = async (): Promise<FavoriteResponse> => {
    const { data } = await axiosInstance.get<FavoriteResponse>('/favorites');
    return data;
};

// (GET) 특정 찜 항목 조회
export const getFavoriteById = async (event_id: number): Promise<FavoriteStatus> => {
    const { data } = await axiosInstance.get<FavoriteStatus>(`/favorites/event/${event_id}`);
    return data;
}

// (POST) 새로운 행사를 찜 목록에 추가
export const addFavorite = async (event_id: number): Promise<FavoriteCreationResponse> => {
    const { data } = await axiosInstance.post<FavoriteCreationResponse>('/favorites/', { event_id });
    return data;
};

// (DELETE) 찜 목록에서 특정 행사를 삭제
export const deleteFavorite = async (favorite_id: number): Promise<void> => {
    await axiosInstance.delete(`/favorites/${favorite_id}`);
};
