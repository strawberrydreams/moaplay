/**
 * 캘린더 컨텍스트 유틸리티
 * 
 * 캘린더 컨텍스트와 관련된 타입, 컨텍스트 객체, 훅을 정의합니다.
 * Fast Refresh 호환성을 위해 컴포넌트가 아닌 요소들을 별도 파일로 분리했습니다.
 */

import React, { createContext, useContext } from 'react';

/**
 * 캘린더 컨텍스트 타입
 */
export interface CalendarContextType {
  /**
   * 캘린더 새로고침 함수 등록
   * @param refreshFn 새로고침 함수
   * @returns 등록 해제 함수
   */
  registerRefreshFunction: (refreshFn: () => Promise<void>) => () => void;
  
  /**
   * 모든 등록된 캘린더 새로고침
   */
  refreshAllCalendars: () => Promise<void>;
  
  /**
   * 찜하기 상태 변경 시 캘린더 새로고침
   * @param eventId 변경된 행사 ID
   */
  onFavoriteChange: (eventId: number) => Promise<void>;
}

/**
 * 캘린더 컨텍스트
 */
export const CalendarContext = createContext<CalendarContextType | null>(null);

/**
 * 캘린더 컨텍스트 사용 훅
 * 
 * 캘린더 새로고침 기능을 사용할 수 있는 훅입니다.
 * 컨텍스트가 제공되지 않은 경우 에러를 발생시킵니다.
 */
export const useCalendarContext = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  
  return context;
};

/**
 * 캘린더 새로고침 등록 훅
 * 
 * 캘린더 컴포넌트에서 새로고침 함수를 등록하는데 사용됩니다.
 * 컴포넌트가 언마운트될 때 자동으로 등록이 해제됩니다.
 */
export const useCalendarRefresh = (refreshFn: () => Promise<void>) => {
  const { registerRefreshFunction } = useCalendarContext();
  
  React.useEffect(() => {
    return registerRefreshFunction(refreshFn);
  }, [registerRefreshFunction, refreshFn]);
};
