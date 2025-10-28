// Admin API 관련 타입 정의

import { PaginationInfo, UserSummary } from './index';
import { EventListResponse } from './events';

/**
 * 관리자 대시보드 통계
 */
export interface DashboardStatsResponse {
  approved_events: number;
  pending_events: number;
  total_users: number;
  pending_organizers: number;
  recent_activities: RecentActivity[];
}

export interface AdminDashboardStats {
  approvedEvents: number;
  pendingEvents: number;
  totalUsers: number;
  pendingOrganizers: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  created_at: string;
}

/**
 * 승인 대기 행사 목록
 */
export interface PendingListResponse {
  items: EventListResponse[];
  pagination: PaginationInfo;
}

/**
 * 승인된 행사 목록
 */
export interface ApprovedListResponse {
  items: EventListResponse[];
  pagination: PaginationInfo;
}

/**
 * 사용자 목록 응답
 */
export interface AdminUserInfo {
  id: number;
  user_id: string;
  nickname: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface UserListResponse {
  items: AdminUserInfo[];
  pagination: PaginationInfo;
}

/**
 * 주최자 인증 신청 정보
 */
export interface OrganizerApplication {
  id: number;
  user_id: number;
  user: UserSummary;
  official_email: string;
  contact_number: string;
  business_number: string;
  company_name: string;
  document_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizerApplicationListResponse {
  items: OrganizerApplication[];
  pagination: PaginationInfo;
}

/**
 * 주최자 인증 신청 생성 요청
 */
export interface OrganizerApplicationCreate {
  official_email: string;
  contact_number: string;
  business_number: string;
  company_name: string;
  document_urls: string[];
}

/**
 * 주최자 인증 신청 상태 응답
 */
export interface ApplicationStatusResponse {
  has_application: boolean;
  application?: OrganizerApplication;
  user_role: 'user' | 'organizer' | 'admin';
  can_apply: boolean;
}
/**
 * 행사 승인/거절 요청
 */
export interface EventApprovalRequest {
  admin_comment?: string;
}

/**
 * 주최자 인증 승인/거절 요청
 */
export interface ApplicationApprovalRequest {
  admin_comment?: string;
}