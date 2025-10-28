/**
 * 리뷰 전역 상태 관리 컨텍스트
 * 
 * 여러 컴포넌트 간 리뷰 상태 동기화를 위한 컨텍스트입니다.
 * 리뷰 작성/수정/삭제 시 모든 관련 컴포넌트가 자동으로 업데이트됩니다.
 */

import React, { createContext, useCallback, useContext } from 'react';
import { ReviewListItem } from '../types/reviews';

/**
 * 리뷰 변경 타입
 */
type ReviewChangeType = 'created' | 'updated' | 'deleted';

/**
 * 리뷰 변경 이벤트
 */
interface ReviewChangeEvent {
  type: ReviewChangeType;
  eventId: number;
  review?: ReviewListItem;
  reviewId?: number;
}

/**
 * 리뷰 변경 리스너 타입
 */
type ReviewChangeListener = (event: ReviewChangeEvent) => void;

/**
 * 리뷰 컨텍스트 타입
 */
interface ReviewContextType {
  /**
   * 리뷰 생성 알림
   * @param eventId 행사 ID
   * @param review 생성된 리뷰
   */
  notifyReviewCreated: (eventId: number, review: ReviewListItem) => void;

  /**
   * 리뷰 수정 알림
   * @param eventId 행사 ID
   * @param review 수정된 리뷰
   */
  notifyReviewUpdated: (eventId: number, review: ReviewListItem) => void;

  /**
   * 리뷰 삭제 알림
   * @param eventId 행사 ID
   * @param reviewId 삭제된 리뷰 ID
   */
  notifyReviewDeleted: (eventId: number, reviewId: number) => void;

  /**
   * 리뷰 변경 리스너 등록
   * @param listener 리스너 함수
   * @returns 리스너 해제 함수
   */
  subscribeReviewChange: (listener: ReviewChangeListener) => () => void;
}

/**
 * 리뷰 컨텍스트
 */
const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

/**
 * 리뷰 컨텍스트 Provider Props
 */
interface ReviewProviderProps {
  children: React.ReactNode;
}

/**
 * 리뷰 컨텍스트 Provider
 * 
 * 애플리케이션 최상위에서 리뷰 상태를 관리합니다.
 */
export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  // useRef를 사용하여 listeners를 관리 (무한 루프 방지)
  const listenersRef = React.useRef<Set<ReviewChangeListener>>(new Set());

  /**
   * 리뷰 변경 알림 (공통 로직)
   */
  const notifyChange = useCallback((event: ReviewChangeEvent) => {
    // 모든 리스너에게 알림
    listenersRef.current.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('리뷰 변경 리스너 실행 오류:', error);
      }
    });
  }, []); // listeners를 의존성에서 제거

  /**
   * 리뷰 생성 알림
   */
  const notifyReviewCreated = useCallback((eventId: number, review: ReviewListItem) => {
    notifyChange({
      type: 'created',
      eventId,
      review
    });
  }, [notifyChange]);

  /**
   * 리뷰 수정 알림
   */
  const notifyReviewUpdated = useCallback((eventId: number, review: ReviewListItem) => {
    notifyChange({
      type: 'updated',
      eventId,
      review
    });
  }, [notifyChange]);

  /**
   * 리뷰 삭제 알림
   */
  const notifyReviewDeleted = useCallback((eventId: number, reviewId: number) => {
    notifyChange({
      type: 'deleted',
      eventId,
      reviewId
    });
  }, [notifyChange]);

  /**
   * 리뷰 변경 리스너 등록
   */
  const subscribeReviewChange = useCallback((listener: ReviewChangeListener) => {
    listenersRef.current.add(listener);

    // 리스너 해제 함수 반환
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const value: ReviewContextType = {
    notifyReviewCreated,
    notifyReviewUpdated,
    notifyReviewDeleted,
    subscribeReviewChange
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

/**
 * 리뷰 컨텍스트 훅
 * 
 * 리뷰 전역 상태에 접근하기 위한 훅입니다.
 * 
 * @throws {Error} ReviewProvider 외부에서 사용 시 에러 발생
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useReviewContext = (): ReviewContextType => {
  const context = useContext(ReviewContext);
  
  if (!context) {
    throw new Error('useReviewContext는 ReviewProvider 내부에서만 사용할 수 있습니다.');
  }
  
  return context;
};

/**
 * 리뷰 동기화 훅
 * 
 * 컴포넌트에서 리뷰 상태 변경을 감지하고 자동으로 업데이트합니다.
 * 
 * @param eventId 행사 ID (선택사항, 특정 행사의 리뷰만 감지)
 * @param onReviewChange 리뷰 상태 변경 콜백
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useReviewSync = (
  eventId?: number,
  onReviewChange?: (event: ReviewChangeEvent) => void
) => {
  const { subscribeReviewChange } = useReviewContext();
  
  // onReviewChange를 ref로 관리하여 의존성 문제 해결
  const onReviewChangeRef = React.useRef(onReviewChange);
  
  React.useEffect(() => {
    onReviewChangeRef.current = onReviewChange;
  }, [onReviewChange]);

  React.useEffect(() => {
    if (!onReviewChangeRef.current) return;

    // 리뷰 변경 리스너 등록
    return subscribeReviewChange(event => {
      // eventId가 지정된 경우, 해당 행사의 리뷰만 처리
      if (eventId === undefined || event.eventId === eventId) {
        onReviewChangeRef.current?.(event);
      }
    });
  }, [eventId, subscribeReviewChange]); // onReviewChange를 의존성에서 제거
};
