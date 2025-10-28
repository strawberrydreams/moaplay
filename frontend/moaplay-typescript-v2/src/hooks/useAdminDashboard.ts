/**
 * 관리자 대시보드 관련 커스텀 훅
 * 
 * 대시보드 통계 조회, 승인 대기 행사 관리 등의 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../services/adminService';
import { AdminDashboardStats, OrganizerApplication } from '../types/admin';
import { EventListItem } from '../types/events';
import { PaginationInfo } from '../types';

/**
 * 관리자 대시보드 훅의 반환 타입
 */
interface UseAdminDashboardReturn {
  // 대시보드 통계
  stats: AdminDashboardStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // 승인 대기 행사
  pendingEvents: EventListItem[];
  pendingEventsLoading: boolean;
  pendingEventsError: string | null;
  pendingEventsPagination: PaginationInfo | null;
  
  // 승인된 행사
  approvedEvents: EventListItem[];
  approvedEventsLoading: boolean;
  approvedEventsError: string | null;
  approvedEventsPagination: PaginationInfo | null;
  
  // 주최자 인증 신청
  pendingApplications: OrganizerApplication[];
  pendingApplicationsLoading: boolean;
  pendingApplicationsError: string | null;
  pendingApplicationsPagination: PaginationInfo | null;
  
  // 액션 함수들
  refreshStats: () => Promise<void>;
  loadPendingEvents: (page?: number) => Promise<void>;
  loadApprovedEvents: (page?: number) => Promise<void>;
  loadPendingApplications: (page?: number) => Promise<void>;
  approveEvent: (eventId: number) => Promise<void>;
  rejectEvent: (eventId: number, reason: string) => Promise<void>;
  approveApplication: (applicationId: number) => Promise<void>;
  rejectApplication: (applicationId: number, reason: string) => Promise<void>;
}

/**
 * 관리자 대시보드 커스텀 훅
 * 
 * 대시보드 통계, 행사 승인/거절 등의 관리자 기능을 제공합니다.
 */
export const useAdminDashboard = (): UseAdminDashboardReturn => {
  // 대시보드 통계 상태
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // 승인 대기 행사 상태
  const [pendingEvents, setPendingEvents] = useState<EventListItem[]>([]);
  const [pendingEventsLoading, setPendingEventsLoading] = useState(false);
  const [pendingEventsError, setPendingEventsError] = useState<string | null>(null);
  const [pendingEventsPagination, setPendingEventsPagination] = useState<PaginationInfo | null>(null);
  
  // 승인된 행사 상태
  const [approvedEvents, setApprovedEvents] = useState<EventListItem[]>([]);
  const [approvedEventsLoading, setApprovedEventsLoading] = useState(false);
  const [approvedEventsError, setApprovedEventsError] = useState<string | null>(null);
  const [approvedEventsPagination, setApprovedEventsPagination] = useState<PaginationInfo | null>(null);
  
  // 주최자 인증 신청 상태
  const [pendingApplications, setPendingApplications] = useState<OrganizerApplication[]>([]);
  const [pendingApplicationsLoading, setPendingApplicationsLoading] = useState(false);
  const [pendingApplicationsError, setPendingApplicationsError] = useState<string | null>(null);
  const [pendingApplicationsPagination, setPendingApplicationsPagination] = useState<PaginationInfo | null>(null);

  /**
   * 대시보드 통계 응답을 정규화합니다.
   * 백엔드 snake_case → 프론트엔드 camelCase 변환
   */
  const toAdminDashboardStats = (resp: unknown): AdminDashboardStats => {
    // 응답 구조: { data: { approved_events, pending_events, ... } }
    const data: Record<string, any> = (resp && typeof resp === 'object' && 'data' in resp) ? (resp as any).data : (resp as any);
    
    return {
      approvedEvents: data?.approved_events ?? 0,
      pendingEvents: data?.pending_events ?? 0,
      totalUsers: data?.total_users ?? 0,
      pendingOrganizers: data?.pending_organizers ?? 0,
      recentActivities: data?.recent_activities ? [
        {
          id: 1,
          type: 'new_events',
          description: `이번 주 신규 행사: ${data.recent_activities.new_events_this_week}개`,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          type: 'new_users',
          description: `이번 주 신규 회원: ${data.recent_activities.new_users_this_week}명`,
          created_at: new Date().toISOString()
        }
      ] : []
    };
  };

  /**
   * 대시보드 통계를 새로고침합니다.
   */
  const refreshStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const dashboardStats = await AdminService.getDashboardStats();
      setStats(toAdminDashboardStats(dashboardStats));
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      setStatsError('대시보드 통계를 불러오는데 실패했습니다.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /**
   * 승인 대기 행사 목록을 로드합니다.
   * 
   * @param page 페이지 번호 (기본값: 1)
   */
  const loadPendingEvents = useCallback(async (page: number = 1) => {
    try {
      setPendingEventsLoading(true);
      setPendingEventsError(null);
      
      const result = await AdminService.getPendingEvents(page, 20);
      const resultData = result as any;
      setPendingEvents(resultData?.items ?? resultData?.events ?? []);
      setPendingEventsPagination(resultData?.pagination ?? null);
    } catch (error) {
      console.error('승인 대기 행사 조회 실패:', error);
      setPendingEventsError('승인 대기 행사를 불러오는데 실패했습니다.');
    } finally {
      setPendingEventsLoading(false);
    }
  }, []);

  /**
   * 승인된 행사 목록을 로드합니다.
   * 
   * @param page 페이지 번호 (기본값: 1)
   */
  const loadApprovedEvents = useCallback(async (page: number = 1) => {
    try {
      setApprovedEventsLoading(true);
      setApprovedEventsError(null);
      
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

      setApprovedEvents(list);
      setApprovedEventsPagination(data.pagination ?? null);
    } catch (error) {
      console.error('승인된 행사 조회 실패:', error);
      setApprovedEventsError('승인된 행사를 불러오는데 실패했습니다.');
    } finally {
      setApprovedEventsLoading(false);
    }
  }, []);

  /**
   * 주최자 인증 대기 신청 목록을 로드합니다.
   * 
   * @param page 페이지 번호 (기본값: 1)
   */
  const loadPendingApplications = useCallback(async (page: number = 1) => {
    try {
      setPendingApplicationsLoading(true);
      setPendingApplicationsError(null);
      
      const result = await AdminService.getOrganizerApplications(page, 20);
      setPendingApplications(result.items);
      setPendingApplicationsPagination(result.pagination);
    } catch (error) {
      console.error('주최자 인증 신청 조회 실패:', error);
      setPendingApplicationsError('주최자 인증 신청을 불러오는데 실패했습니다.');
    } finally {
      setPendingApplicationsLoading(false);
    }
  }, []);

  /**
   * 행사를 승인합니다.
   * 
   * @param eventId 승인할 행사 ID
   */
  const approveEvent = useCallback(async (eventId: number) => {
    try {
      await AdminService.approveEvent(eventId);
      
      // 승인 후 목록 새로고침
      await Promise.all([
        refreshStats(),
        loadPendingEvents(),
        loadApprovedEvents()
      ]);
      
      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('행사가 성공적으로 승인되었습니다.');
    } catch (error) {
      console.error('행사 승인 실패:', error);
      throw new Error('행사 승인에 실패했습니다.');
    }
  }, [refreshStats, loadPendingEvents, loadApprovedEvents]);

  /**
   * 행사를 거절합니다.
   * 
   * @param eventId 거절할 행사 ID
   * @param reason 거절 사유
   */
  const rejectEvent = useCallback(async (eventId: number, reason: string) => {
    try {
      await AdminService.rejectEvent(eventId, { admin_comment: reason });
      
      // 거절 후 목록 새로고침
      await Promise.all([
        refreshStats(),
        loadPendingEvents()
      ]);
      
      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('행사가 성공적으로 거절되었습니다.');
    } catch (error) {
      console.error('행사 거절 실패:', error);
      throw new Error('행사 거절에 실패했습니다.');
    }
  }, [refreshStats, loadPendingEvents]);

  /**
   * 주최자 인증 신청을 승인합니다.
   * 
   * @param applicationId 승인할 신청 ID
   */
  const approveApplication = useCallback(async (applicationId: number) => {
    try {
      await AdminService.approveOrganizerApplication(applicationId);
      
      // 승인 후 목록 새로고침
      await Promise.all([
        refreshStats(),
        loadPendingApplications()
      ]);
      
      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('주최자 인증 신청이 성공적으로 승인되었습니다.');
    } catch (error) {
      console.error('주최자 인증 신청 승인 실패:', error);
      throw new Error('주최자 인증 신청 승인에 실패했습니다.');
    }
  }, [refreshStats, loadPendingApplications]);

  /**
   * 주최자 인증 신청을 거절합니다.
   * 
   * @param applicationId 거절할 신청 ID
   * @param reason 거절 사유
   */
  const rejectApplication = useCallback(async (applicationId: number, reason: string) => {
    try {
      await AdminService.rejectOrganizerApplication(applicationId, { admin_comment: reason });
      
      // 거절 후 목록 새로고침
      await Promise.all([
        refreshStats(),
        loadPendingApplications()
      ]);
      
      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('주최자 인증 신청이 성공적으로 거절되었습니다.');
    } catch (error) {
      console.error('주최자 인증 신청 거절 실패:', error);
      throw new Error('주최자 인증 신청 거절에 실패했습니다.');
    }
  }, [refreshStats, loadPendingApplications]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    // 대시보드 통계
    stats,
    statsLoading,
    statsError,
    
    // 승인 대기 행사
    pendingEvents,
    pendingEventsLoading,
    pendingEventsError,
    pendingEventsPagination,
    
    // 승인된 행사
    approvedEvents,
    approvedEventsLoading,
    approvedEventsError,
    approvedEventsPagination,
    
    // 주최자 인증 신청
    pendingApplications,
    pendingApplicationsLoading,
    pendingApplicationsError,
    pendingApplicationsPagination,
    
    // 액션 함수들
    refreshStats,
    loadPendingEvents,
    loadApprovedEvents,
    loadPendingApplications,
    approveEvent,
    rejectEvent,
    approveApplication,
    rejectApplication
  };
};