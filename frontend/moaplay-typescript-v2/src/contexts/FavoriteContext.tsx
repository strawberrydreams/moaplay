/**
 * 찜하기 전역 상태 관리 컨텍스트
 * 
 * 여러 컴포넌트 간 찜하기 상태 동기화를 위한 컨텍스트입니다.
 * 찜하기 토글 시 모든 관련 컴포넌트가 자동으로 업데이트됩니다.
 */

import React, { createContext, useCallback, useContext, useState } from 'react';

/**
 * 찜하기 변경 리스너 타입
 */
type FavoriteChangeListener = (eventId: number, isFavorite: boolean) => void;

/**
 * 찜하기 컨텍스트 타입
 */
interface FavoriteContextType {
  /**
   * 찜하기 상태 변경 알림
   * @param eventId 행사 ID
   * @param isFavorite 새로운 찜하기 상태
   */
  notifyFavoriteChange: (eventId: number, isFavorite: boolean) => void;

  /**
   * 찜하기 변경 리스너 등록
   * @param listener 리스너 함수
   * @returns 리스너 해제 함수
   */
  subscribeFavoriteChange: (listener: FavoriteChangeListener) => () => void;

  /**
   * 특정 이벤트의 찜하기 상태 조회
   * @param eventId 행사 ID
   * @returns 찜하기 상태 (undefined면 알 수 없음)
   */
  getFavoriteStatus: (eventId: number) => boolean | undefined;

  /**
   * 특정 이벤트의 찜하기 상태 설정
   * @param eventId 행사 ID
   * @param isFavorite 찜하기 상태
   */
  setFavoriteStatus: (eventId: number, isFavorite: boolean) => void;
}

/**
 * 찜하기 컨텍스트
 */
const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

/**
 * 찜하기 컨텍스트 Provider Props
 */
interface FavoriteProviderProps {
  children: React.ReactNode;
}

/**
 * 찜하기 컨텍스트 Provider
 * 
 * 애플리케이션 최상위에서 찜하기 상태를 관리합니다.
 */
export const FavoriteProvider: React.FC<FavoriteProviderProps> = ({ children }) => {
  const listenersRef = React.useRef<Set<FavoriteChangeListener>>(new Set());
  const [favoriteStatusMap, setFavoriteStatusMap] = useState<Map<number, boolean>>(new Map());

  /**
   * 찜하기 상태 변경 알림
   */
  const notifyFavoriteChange = useCallback((eventId: number, isFavorite: boolean) => {
    // 상태 맵 업데이트
    setFavoriteStatusMap(prev => {
      const newMap = new Map(prev);
      newMap.set(eventId, isFavorite);
      return newMap;
    });

    // 모든 리스너에게 알림
    listenersRef.current.forEach(listener => {
      try {
        listener(eventId, isFavorite);
      } catch (error) {
        console.error('찜하기 변경 리스너 실행 오류:', error);
      }
    });
  }, []);

  /**
   * 찜하기 변경 리스너 등록
   */
  const subscribeFavoriteChange = useCallback((listener: FavoriteChangeListener) => {
    listenersRef.current.add(listener);

    // 리스너 해제 함수 반환
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  /**
   * 특정 이벤트의 찜하기 상태 조회
   */
  const getFavoriteStatus = useCallback((eventId: number): boolean | undefined => {
    return favoriteStatusMap.get(eventId);
  }, [favoriteStatusMap]);

  /**
   * 특정 이벤트의 찜하기 상태 설정
   */
  const setFavoriteStatus = useCallback((eventId: number, isFavorite: boolean) => {
    setFavoriteStatusMap(prev => {
      const newMap = new Map(prev);
      newMap.set(eventId, isFavorite);
      return newMap;
    });
  }, []);

  const value: FavoriteContextType = {
    notifyFavoriteChange,
    subscribeFavoriteChange,
    getFavoriteStatus,
    setFavoriteStatus
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

/**
 * 찜하기 컨텍스트 훅
 * 
 * 찜하기 전역 상태에 접근하기 위한 훅입니다.
 * 
 * @throws {Error} FavoriteProvider 외부에서 사용 시 에러 발생
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useFavoriteContext = (): FavoriteContextType => {
  const context = useContext(FavoriteContext);
  
  if (!context) {
    throw new Error('useFavoriteContext는 FavoriteProvider 내부에서만 사용할 수 있습니다.');
  }
  
  return context;
};

/**
 * 찜하기 동기화 훅
 * 
 * 컴포넌트에서 찜하기 상태 변경을 감지하고 자동으로 업데이트합니다.
 * 
 * @param eventId 행사 ID
 * @param onFavoriteChange 찜하기 상태 변경 콜백
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useFavoriteSync = (
  eventId: number,
  onFavoriteChange?: (isFavorite: boolean) => void
) => {
  const { subscribeFavoriteChange, getFavoriteStatus, setFavoriteStatus } = useFavoriteContext();

  React.useEffect(() => {
    if (!onFavoriteChange) return;

    // 찜하기 변경 리스너 등록
    return subscribeFavoriteChange((changedEventId, isFavorite) => {
      if (changedEventId === eventId) {
        onFavoriteChange(isFavorite);
      }
    });
  }, [eventId, onFavoriteChange, subscribeFavoriteChange]);

  return {
    getFavoriteStatus: () => getFavoriteStatus(eventId),
    setFavoriteStatus: (isFavorite: boolean) => setFavoriteStatus(eventId, isFavorite)
  };
};
