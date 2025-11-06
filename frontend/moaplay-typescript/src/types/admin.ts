import type { Host } from './';

// =================================================================
// == Response (응답) 타입들
// =================================================================

// 관리자 대시보드 데이터 타입
// API: GET /api/admin/dashboard
export interface AdminDashboard {
    totalEvents: number;
    approvedEvents: number;
    pendingEvents: number;
    totalUsers: number;
}

// 관리자 목록에서 사용되는 행사 정보의 공통 타입
interface AdminEventListItem {
    id: number;
    title: string;
    summary: string;
    start_date: string;
    end_date: string;
    location: string;
    host: Host;
    status: 'pending' | 'approved' | 'modified' | 'rejected';
    created_at: string;
}

// 승인 대기 목록의 행사 정보 타입
// API: GET /api/admin/pending-list
export type PendingEvent = AdminEventListItem;

// 승인 완료 목록의 행사 정보 타입
// API: GET /api/admin/approved-list
export interface ApprovedEvent extends AdminEventListItem {
    approved_at: string;
    approved_by: number;
}

// 전체 행사 관리 목록의 행사 정보 타입
// API: GET /api/admin/events-list
export interface ManagedEvent extends AdminEventListItem {
    approved_at?: string; // 승인된 행사만 값이 있음
}

export interface UserPagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}
