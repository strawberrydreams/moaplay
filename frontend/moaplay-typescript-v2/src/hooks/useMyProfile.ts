/**
 * 마이페이지 관련 커스텀 훅
 * 
 * 사용자 프로필 정보, 찜한 행사, 작성한 리뷰, 개인 일정 등
 * 마이페이지에서 필요한 모든 데이터를 관리합니다.
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useUserFavorites } from './useFavorites';
import { useMyReviews } from './useReviews';
import { useCalendar } from './useCalendar';
import { UserService } from '../services/userService';
import { User } from '../types';
import { FavoriteListItem } from '../types/favorites';
import { ReviewListItem } from '../types/reviews';

/**
 * 개인정보 수정 요청 타입
 */
export interface UpdateProfileRequest {
  nickname?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  profile_image?: string;
}

/**
 * 비밀번호 변경 요청 타입
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * 마이페이지 훅 반환 타입
 */
export interface UseMyProfileReturn {
  // 사용자 정보
  user: User | null;
  userLoading: boolean;
  userError: string | null;
  
  // 찜한 행사
  favorites: FavoriteListItem[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  totalFavorites: number;
  
  // 작성한 리뷰
  reviews: ReviewListItem[];
  reviewsLoading: boolean;
  reviewsError: string | null;
  totalReviews: number;
  
  // 개인 일정 (캘린더)
  personalSchedules: import('../types').CalendarEvent[];
  schedulesLoading: boolean;
  schedulesError: string | null;
  
  // 액션 함수들
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  refreshSchedules: () => Promise<void>;
  removeFavorite: (eventId: number) => Promise<void>;
}

/**
 * 마이페이지 관련 데이터를 관리하는 커스텀 훅
 * 
 * 사용자 프로필, 찜한 행사, 작성한 리뷰, 개인 일정을 통합 관리합니다.
 */
export const useMyProfile = (): UseMyProfileReturn => {
  const { user: authUser, isAuthenticated, refreshUser } = useAuth();
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // 찜한 행사 관리
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    refresh: refreshFavorites,
    removeFavorite: removeFavoriteFromList,
    pagination: favoritesPagination
  } = useUserFavorites();

  // refreshFavorites를 Promise 기반으로 래핑 (타입 정합성 확보)
  const refreshFavoritesAsync = useCallback(async (): Promise<void> => {
    refreshFavorites();
  }, [refreshFavorites]);

  // 작성한 리뷰 관리
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    totalReviews,
    refreshReviews
  } = useMyReviews({ page: 1, per_page: 5 }); // 마이페이지에서는 최대 5개만 표시

  // 개인 일정 관리 (캘린더)
  const {
    calendarEvents: personalSchedules,
    isLoading: schedulesLoading,
    error: schedulesError,
    refreshEvents: refreshSchedules
  } = useCalendar();

  /**
   * 개인정보 수정
   * User API의 PUT /api/users/me 엔드포인트를 사용합니다.
   */
  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    if (!isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    setUserLoading(true);
    setUserError(null);

    try {
      // UserService.updateMe()를 사용하여 프로필 수정
      await UserService.updateMe(data);

      // 사용자 정보 새로고침
      await refreshUser();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '프로필 수정 중 오류가 발생했습니다.';
      setUserError(errorMessage);
      throw error;
    } finally {
      setUserLoading(false);
    }
  }, [isAuthenticated, refreshUser]);

  /**
   * 비밀번호 변경
   * User API의 PUT /api/users/me/password 엔드포인트를 사용합니다.
   */
  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    if (!isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    if (data.new_password !== data.confirm_password) {
      throw new Error('새 비밀번호가 일치하지 않습니다.');
    }

    setUserLoading(true);
    setUserError(null);

    try {
      // UserService.updatePassword()를 사용하여 비밀번호 변경
      await UserService.updatePassword({
        password: data.current_password,
        new_password: data.new_password
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '비밀번호 변경 중 오류가 발생했습니다.';
      setUserError(errorMessage);
      throw error;
    } finally {
      setUserLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 프로필 이미지 업로드
   */
  const uploadProfileImage = useCallback(async (file: File): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    setUserLoading(true);
    setUserError(null);

    try {
      // 파일 업로드 API 호출
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.data.url;

      // 프로필 이미지 URL 업데이트
      await updateProfile({ profile_image: imageUrl });

      return imageUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '프로필 이미지 업로드 중 오류가 발생했습니다.';
      setUserError(errorMessage);
      throw error;
    } finally {
      setUserLoading(false);
    }
  }, [isAuthenticated, updateProfile]);

  /**
   * 프로필 정보 새로고침
   */
  const refreshProfile = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  /**
   * 찜하기 삭제 (마이페이지에서)
   */
  const removeFavorite = useCallback(async (eventId: number) => {
    try {
      await removeFavoriteFromList(eventId);
    } catch (error) {
      console.error('찜하기 삭제 실패:', error);
      throw error;
    }
  }, [removeFavoriteFromList]);

  // 사용자 정보를 User 타입으로 확장 (useMemo로 메모이제이션)
  const user = useMemo(() => {
    if (!authUser) return null;
    
    return {
      id: authUser.id,
      nickname: authUser.nickname,
      email: authUser.email,
      profile_image: authUser.profileImage || null,
      role: authUser.role,
      username: authUser.userId,
      real_name: undefined, // MyProfileViewModel에 없음
      phone_number: authUser.phone || undefined,
      address: undefined, // MyProfileViewModel에 없음
      preferred_tags: undefined, // MyProfileViewModel에 없음
      created_at: authUser.createdAt.toISOString(),
      updated_at: authUser.updatedAt.toISOString(),
    } as User;
  }, [authUser]);

  return {
    // 사용자 정보
    user,
    userLoading,
    userError,

    // 찜한 행사
    favorites,
    favoritesLoading,
    favoritesError,
    totalFavorites: favoritesPagination.total,

    // 작성한 리뷰
    reviews,
    reviewsLoading,
    reviewsError,
    totalReviews,

    // 개인 일정
    personalSchedules,
    schedulesLoading,
    schedulesError,

    // 액션 함수들
    updateProfile,
    changePassword,
    uploadProfileImage,
    refreshProfile,
    refreshFavorites: refreshFavoritesAsync,
    refreshReviews,
    refreshSchedules,
    removeFavorite,
  };
};