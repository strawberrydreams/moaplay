/**
 * 행사 상세 페이지 관련 커스텀 훅
 * 
 * 행사 상세 정보 조회, 조회수 증가, 찜하기/일정 추가 등의
 * 비즈니스 로직을 관리합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { EventService } from '../services/eventService';
import { FavoriteService } from '../services/favoriteService';
import { ScheduleService } from '../services/scheduleService';
import { EventNormalizer, EventDetailViewModel } from '../normalizers/eventNormalizer';
import { LoadingState } from '../types';
import { useAuth } from './useAuth';

/**
 * 행사 상세 페이지 훅의 반환 타입
 */
export interface UseEventDetailReturn {
  event: EventDetailViewModel | null;
  loading: boolean;
  error: string | null;
  refreshEvent: () => Promise<void>;
  toggleFavorite: () => Promise<void>;
  toggleSchedule: () => Promise<void>;
  isTogglingFavorite: boolean;
  isTogglingSchedule: boolean;
}

/**
 * 행사 상세 정보를 관리하는 커스텀 훅
 * 
 * @param eventId 조회할 행사 ID
 * @returns 행사 상세 정보와 관련 액션들
 */
export const useEventDetail = (eventId: number): UseEventDetailReturn => {
  const [event, setEvent] = useState<EventDetailViewModel | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingSchedule, setIsTogglingSchedule] = useState(false);
  
  const { isAuthenticated } = useAuth();

  /**
   * 행사 상세 정보를 조회합니다
   * 페이지 진입 시 자동으로 조회수가 증가됩니다
   * 로그인한 사용자의 경우 찜하기/일정 상태도 함께 조회합니다
   */
  const fetchEventDetail = useCallback(async () => {
    try {
      setLoadingState({ isLoading: true, error: null });
      
      // EventService.getEventDetail 호출 시 백엔드에서 자동으로 조회수 증가
      const apiEvent = await EventService.getEventDetail(eventId);
      const normalizedEvent = EventNormalizer.toDetailViewModel(apiEvent);
      
      // 로그인한 사용자의 경우 찜하기/일정 상태 조회
      if (isAuthenticated) {
        try {
          // 찜하기 목록 조회
          const favoritesResponse = await FavoriteService.getFavorites({ page: 1, per_page: 100 });
          const favoriteItem = favoritesResponse.favorites.find(fav => fav.event.id === eventId);
          
          if (favoriteItem) {
            normalizedEvent.isFavorite = true;
            normalizedEvent.favoriteId = favoriteItem.id;
          }
          
          // 일정 목록 조회
          const schedulesResponse = await ScheduleService.getSchedules();
          const scheduleItem = schedulesResponse.schedules.find(sch => sch.event.id === eventId);
          
          if (scheduleItem) {
            normalizedEvent.isInSchedule = true;
            normalizedEvent.scheduleId = scheduleItem.id;
          }
        } catch (error) {
          // 찜하기/일정 조회 실패는 무시 (행사 정보는 표시)
          console.warn('Failed to fetch favorite/schedule status:', error);
        }
      }
      
      setEvent(normalizedEvent);
      setLoadingState({ isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch event detail:', error);
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : '행사 정보를 불러오는데 실패했습니다.' 
      });
    }
  }, [eventId, isAuthenticated]);

  /**
   * 행사 정보를 새로고침합니다
   */
  const refreshEvent = useCallback(async () => {
    await fetchEventDetail();
  }, [fetchEventDetail]);

  /**
   * 찜하기 상태를 토글합니다
   */
  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated || !event) {
      // 로그인하지 않은 경우 로그인 모달 표시 로직은 컴포넌트에서 처리
      return;
    }

    // 이미 토글 중이면 중복 요청 방지
    if (isTogglingFavorite) {
      return;
    }

    // 현재 상태를 저장 (낙관적 업데이트 전)
    const previousState = event.isFavorite;
    const previousFavoriteId = event.favoriteId;

    try {
      setIsTogglingFavorite(true);
      
      // 실제 API 호출 (낙관적 업데이트 전에 API 호출)
      if (previousState && previousFavoriteId) {
        // 찜하기 제거
        await FavoriteService.removeFavorite(previousFavoriteId);
        setEvent(prev => prev ? {
          ...prev,
          isFavorite: false,
          favoriteId: undefined
        } : null);
      } else {
        // 찜하기 추가
        const favorite = await FavoriteService.addFavorite({ event_id: event.id });
        setEvent(prev => prev ? {
          ...prev,
          isFavorite: true,
          favoriteId: favorite.id
        } : null);
      }
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // 에러 발생 시 상태 롤백
      setEvent(prev => prev ? {
        ...prev,
        isFavorite: previousState,
        favoriteId: previousFavoriteId
      } : null);
      
      // 사용자에게 에러 메시지 표시
      alert('찜하기 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [isAuthenticated, event, isTogglingFavorite]);

  /**
   * 개인 일정 추가/제거를 토글합니다
   */
  const toggleSchedule = useCallback(async () => {
    if (!isAuthenticated || !event) {
      return;
    }

    // 이미 토글 중이면 중복 요청 방지
    if (isTogglingSchedule) {
      return;
    }

    // 현재 상태를 저장 (낙관적 업데이트 전)
    const previousState = event.isInSchedule;
    const previousScheduleId = event.scheduleId;

    try {
      setIsTogglingSchedule(true);
      
      // 실제 API 호출 (낙관적 업데이트 전에 API 호출)
      if (previousState && previousScheduleId) {
        // 일정 제거
        await ScheduleService.removeSchedule(previousScheduleId);
        setEvent(prev => prev ? {
          ...prev,
          isInSchedule: false,
          scheduleId: undefined
        } : null);
      } else {
        // 일정 추가
        const schedule = await ScheduleService.addSchedule({
          event_id: event.id
        });
        setEvent(prev => prev ? {
          ...prev,
          isInSchedule: true,
          scheduleId: schedule.id
        } : null);
      }
      
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      // 에러 발생 시 상태 롤백
      setEvent(prev => prev ? {
        ...prev,
        isInSchedule: previousState,
        scheduleId: previousScheduleId
      } : null);
      
      // 사용자에게 에러 메시지 표시
      alert('일정 추가/제거 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsTogglingSchedule(false);
    }
  }, [isAuthenticated, event, isTogglingSchedule]);

  // 컴포넌트 마운트 시 행사 정보 조회
  useEffect(() => {
    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId, fetchEventDetail]);

  return {
    event,
    loading: loadingState.isLoading,
    error: loadingState.error ?? null,
    refreshEvent,
    toggleFavorite,
    toggleSchedule,
    isTogglingFavorite,
    isTogglingSchedule
  };
};