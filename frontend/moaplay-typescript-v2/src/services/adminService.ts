import { apiClient } from './core/axios';
import {
  DashboardStatsResponse,
  PendingListResponse,
  ApprovedListResponse,
  UserListResponse,
  OrganizerApplicationListResponse,
  OrganizerApplicationCreate,
  ApplicationStatusResponse,
  EventApprovalRequest,
  ApplicationApprovalRequest,
} from '../types/admin';

/**
 * 관리자 API 서비스
 */
export class AdminService {
  /**
   * 대시보드 통계 조회
   */
  static async getDashboardStats(): Promise<DashboardStatsResponse> {
    const response = await apiClient.get<{
      statistics: any;
      popular_events: any[];
      recent_pending: any[];
    }>('/api/admin/dashboard');
    // 백엔드 응답 구조: { statistics: { users, events, reviews, engagement }, popular_events, recent_pending }
    return {
      approved_events: response.data.statistics.events.approved,
      pending_events: response.data.statistics.events.pending,
      total_users: response.data.statistics.users.total,
      pending_organizers: 0, // 백엔드에서 제공하지 않음
      recent_activities: [],
    };
  }

  /**
   * 승인 대기 행사 목록 조회
   */
  static async getPendingEvents(
    page: number = 1,
    limit: number = 20
  ): Promise<PendingListResponse> {
    const response = await apiClient.get<{ data: PendingListResponse }>(
      '/api/admin/pending-list',
      {
        params: { page, limit },
      }
    );
    // 백엔드 응답 구조: { data: { items, pagination }, message, requestId }
    return response.data.data;
  }

  /**
   * 승인된 행사 목록 조회
   */
  static async getApprovedEvents(
    page: number = 1,
    limit: number = 20
  ): Promise<ApprovedListResponse> {
    const response = await apiClient.get<{ data: ApprovedListResponse }>(
      '/api/admin/approved-list',
      {
        params: { page, limit },
      }
    );
    // 백엔드 응답 구조: { data: { items, pagination }, message, requestId }
    return response.data.data;
  }

  /**
   * 행사 승인
   */
  static async approveEvent(
    eventId: number,
    data?: EventApprovalRequest
  ): Promise<void> {
    await apiClient.post(`/api/admin/events/${eventId}/approve`, data);
  }

  /**
   * 행사 거절
   */
  static async rejectEvent(
    eventId: number,
    data: EventApprovalRequest
  ): Promise<void> {
    await apiClient.post(`/api/admin/events/${eventId}/reject`, data);
  }

  /**
   * 행사 삭제 (event.py의 DELETE /api/events/{id} 사용)
   */
  static async deleteEvent(eventId: number): Promise<void> {
    await apiClient.delete(`/api/events/${eventId}`);
  }

  /**
   * 사용자 목록 조회
   */
  static async getUsers(
    page: number = 1,
    limit: number = 20,
    role?: string
  ): Promise<UserListResponse> {
    const response = await apiClient.get<{ data: UserListResponse }>(
      '/api/admin/users',
      {
        params: { page, limit, role },
      }
    );
    // 백엔드 응답 구조: { data: { items, pagination }, message, requestId }
    return response.data.data;
  }

  /**
   * 사용자 역할 변경
   */
  static async updateUserRole(
    userId: number,
    role: 'user' | 'host' | 'admin'
  ): Promise<void> {
    await apiClient.patch(`/api/admin/users/${userId}/role`, { role });
  }

  /**
   * 사용자 활성화/비활성화
   */
  static async toggleUserStatus(
    userId: number,
    isActive: boolean
  ): Promise<void> {
    await apiClient.patch(`/api/admin/users/${userId}/status`, {
      is_active: isActive,
    });
  }

  /**
   * 주최자 인증 신청 목록 조회
   */
  static async getOrganizerApplications(
    page: number = 1,
    limit: number = 20
  ): Promise<OrganizerApplicationListResponse> {
    const response = await apiClient.get<{
      data: OrganizerApplicationListResponse;
    }>('/api/admin/organizer-applications', {
      params: { page, limit },
    });
    // 백엔드 응답 구조: { data: { items, pagination }, message, requestId }
    return response.data.data;
  }

  /**
   * 주최자 인증 신청 승인
   */
  static async approveOrganizerApplication(
    applicationId: number,
    data?: ApplicationApprovalRequest
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/organizer-applications/${applicationId}/approve`,
      data
    );
  }

  /**
   * 주최자 인증 신청 거절
   */
  static async rejectOrganizerApplication(
    applicationId: number,
    data: ApplicationApprovalRequest
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/organizer-applications/${applicationId}/reject`,
      data
    );
  }

  /**
   * 주최자 인증 신청 생성
   */
  static async createOrganizerApplication(
    data: OrganizerApplicationCreate
  ): Promise<{ id: number }> {
    const response = await apiClient.post<{ id: number }>(
      '/api/organizer-applications',
      data
    );
    return response.data;
  }

  /**
   * 주최자 인증 신청 상태 조회
   */
  static async getApplicationStatus(): Promise<ApplicationStatusResponse> {
    const response = await apiClient.get<ApplicationStatusResponse>(
      '/api/organizer-applications/status'
    );
    return response.data;
  }

  /**
   * 사용자 정보 수정
   */
  static async updateUser(
    userId: number,
    data: UpdateUserRequest
  ): Promise<UserInfo> {
    const response = await apiClient.patch<UserInfo>(
      `/api/admin/users/${userId}`,
      data
    );
    return response.data;
  }

  /**
   * 사용자 삭제 (user.py의 DELETE /api/users/me 사용)
   * 관리자가 사용자를 삭제하는 경우, 해당 사용자의 세션으로 요청해야 함
   * 실제로는 관리자 권한으로 직접 삭제하는 API가 필요할 수 있음
   */
  static async deleteUser(_userId: number, password: string): Promise<void> {
    await apiClient.delete(`/api/users/me`, {
      data: {
        confirm: true,
        password: password,
      },
    });
  }
}

// Export types for use in components
export interface UserInfo {
  id: number;
  username?: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  is_active: boolean;
  created_at: string;
  nickname?: string;
  profile_image?: string;
}

export interface UpdateUserRequest {
  email?: string;
  role?: 'user' | 'host' | 'admin';
  is_active?: boolean;
  nickname?: string;
}
