/**
 * 승인된 행사 관리 커스텀 훅
 * 
 * 승인된 행사 목록 조회, 수정, 삭제 등의 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../services/adminService';
import { EventListItem } from '../types/events';
import { PaginationInfo } from '../types';

/**
 * 승인된 행사 관리 훅의 반환 타입
 */
interface UseApprovedEventsReturn {
  // 행사 목록
  events: EventListItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  
  // 액션 함수들
  loadEvents: (page?: number) => Promise<void>;
  deleteEvent: (eventId: number) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

/**
 * 승인된 행사 관리 커스텀 훅
 * 
 * 승인된 행사 목록 조회, 수정, 삭제 등의 기능을 제공합니다.
 */
export const useApprovedEvents = (): UseApprovedEventsReturn => {
  // 행사 목록 상태
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  /**
   * 승인된 행사 목록을 로드합니다.
   * 
   * @param page 페이지 번호 (기본값: 1)
   */
  const loadEvents = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AdminService.getApprovedEvents(page, 20);

      // Narrow unknown → known structure
      type EventsPageResp = {
        items?: EventListItem[];
        events?: EventListItem[];
        pagination?: PaginationInfo | null;
      };

      const data = result as unknown as EventsPageResp;
      const list = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.events)
          ? data.events
          : [];

      setEvents(list);
      setPagination(data.pagination ?? null);
    } catch (error) {
      console.error('승인된 행사 조회 실패:', error);
      setError('승인된 행사를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 행사를 삭제합니다.
   * 
   * @param eventId 삭제할 행사 ID
   */
  const deleteEvent = useCallback(async (eventId: number) => {
    try {
      await AdminService.deleteEvent(eventId);
      
      // 삭제 후 목록 새로고침
      await loadEvents(pagination?.current_page || 1);
      
      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('행사가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('행사 삭제 실패:', error);
      throw new Error('행사 삭제에 실패했습니다.');
    }
  }, [loadEvents, pagination?.current_page]);

  /**
   * 행사 목록을 새로고침합니다.
   */
  const refreshEvents = useCallback(async () => {
    await loadEvents(pagination?.current_page || 1);
  }, [loadEvents, pagination?.current_page]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    // 행사 목록
    events,
    loading,
    error,
    pagination,
    
    // 액션 함수들
    loadEvents,
    deleteEvent,
    refreshEvents
  };
};