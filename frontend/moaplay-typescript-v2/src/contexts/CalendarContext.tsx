/**
 * 캘린더 컨텍스트 프로바이더
 * 
 * 캘린더 상태와 새로고침 함수를 전역적으로 관리합니다.
 * 찜하기 상태 변경 시 캘린더를 실시간으로 업데이트하는데 사용됩니다.
 * 
 * Fast Refresh 호환성을 위해 컨텍스트 객체와 훅은 calendarContextUtils.ts로 분리되었습니다.
 */

import React, { useCallback, useRef } from 'react';
import { CalendarContext, CalendarContextType } from './calendarContextUtils';

/**
 * 캘린더 컨텍스트 프로바이더 Props
 */
interface CalendarProviderProps {
  children: React.ReactNode;
}

/**
 * 캘린더 컨텍스트 프로바이더
 * 
 * 여러 캘린더 인스턴스의 새로고침 함수를 관리하고,
 * 찜하기 상태 변경 시 모든 캘린더를 업데이트합니다.
 */
export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const refreshFunctionsRef = useRef<Set<() => Promise<void>>>(new Set());

  /**
   * 캘린더 새로고침 함수 등록
   */
  const registerRefreshFunction = useCallback((refreshFn: () => Promise<void>) => {
    refreshFunctionsRef.current.add(refreshFn);
    
    // 등록 해제 함수 반환
    return () => {
      refreshFunctionsRef.current.delete(refreshFn);
    };
  }, []);

  /**
   * 모든 등록된 캘린더 새로고침
   */
  const refreshAllCalendars = useCallback(async () => {
    const refreshPromises = Array.from(refreshFunctionsRef.current).map(refreshFn => 
      refreshFn().catch(error => {
        console.error('Calendar refresh failed:', error);
      })
    );
    
    await Promise.all(refreshPromises);
  }, []);

  /**
   * 찜하기 상태 변경 시 캘린더 새로고침
   */
  const onFavoriteChange = useCallback(async (eventId: number) => {
    console.log('Favorite status changed for event:', eventId);
    await refreshAllCalendars();
  }, [refreshAllCalendars]);

  const contextValue: CalendarContextType = {
    registerRefreshFunction,
    refreshAllCalendars,
    onFavoriteChange,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};