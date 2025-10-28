/**
 * 주최자 인증 신청 관리 커스텀 훅
 * 
 * 주최자 인증 신청 목록 조회, 승인/거절 등의 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../services/adminService';
import { OrganizerApplication } from '../types/admin';
import { PaginationInfo } from '../types';

/**
 * 주최자 인증 신청 관리 훅의 반환 타입
 */
interface UseOrganizerApplicationsReturn {
  // 신청 목록
  applications: OrganizerApplication[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  
  // 액션 함수들
  loadApplications: (page?: number) => Promise<void>;
  approveApplication: (applicationId: number) => Promise<void>;
  rejectApplication: (applicationId: number, reason: string) => Promise<void>;
  refreshApplications: () => Promise<void>;
}

/**
 * 주최자 인증 신청 관리 커스텀 훅
 * 
 * 주최자 인증 신청 목록 조회, 승인/거절 등의 기능을 제공합니다.
 */
export const useOrganizerApplications = (): UseOrganizerApplicationsReturn => {
  // 신청 목록 상태
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  /**
   * 주최자 인증 신청 목록을 로드합니다.
   * 
   * @param page 페이지 번호 (기본값: 1)
   */
  const loadApplications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AdminService.getOrganizerApplications(page, 20);
      setApplications(result.items);
      setPagination(result.pagination);
    } catch (error) {
      console.error('주최자 인증 신청 조회 실패:', error);
      setError('주최자 인증 신청을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 주최자 인증 신청을 승인합니다.
   * 
   * @param applicationId 승인할 신청 ID
   */
  const approveApplication = useCallback(async (applicationId: number) => {
    try {
      await AdminService.approveOrganizerApplication(applicationId);
      
      // 승인 후 목록 새로고침
      await loadApplications();
      
      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('주최자 인증 신청이 성공적으로 승인되었습니다.');
    } catch (error) {
      console.error('주최자 인증 신청 승인 실패:', error);
      throw new Error('주최자 인증 신청 승인에 실패했습니다.');
    }
  }, [loadApplications]);

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
      await loadApplications();
      
      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('주최자 인증 신청이 성공적으로 거절되었습니다.');
    } catch (error) {
      console.error('주최자 인증 신청 거절 실패:', error);
      throw new Error('주최자 인증 신청 거절에 실패했습니다.');
    }
  }, [loadApplications]);

  /**
   * 신청 목록을 새로고침합니다.
   */
  const refreshApplications = useCallback(async () => {
    await loadApplications();
  }, [loadApplications]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    // 신청 목록
    applications,
    loading,
    error,
    pagination,
    
    // 액션 함수들
    loadApplications,
    approveApplication,
    rejectApplication,
    refreshApplications
  };
};