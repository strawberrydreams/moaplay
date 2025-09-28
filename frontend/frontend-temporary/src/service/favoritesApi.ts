import axiosInstance from './core';
import type { Favorite, FavoriteCreationResponse, CreateFavoritePayload } from '../types/favorites';

// (GET) 사용자의 모든 찜 목록 조회
export const getFavorites = async (): Promise<{ favorites: Favorite[] }> => {
    const { data } = await axiosInstance.get<{ favorites: Favorite[] }>('/favorites');
    return data;
};

// (POST) 새로운 행사를 찜 목록에 추가
export const addFavorite = async (payload: CreateFavoritePayload): Promise<FavoriteCreationResponse> => {
    const { data } = await axiosInstance.post<FavoriteCreationResponse>('/favorite', payload);
    return data;
};

// (DELETE) 찜 목록에서 특정 행사를 삭제
export const deleteFavorite = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/favorite/${id}`);
};
