import axiosInstance from './core/axios';
import type { PaginatedResponse } from '../types/index';
import type { AdminDashboard, PendingEvent, ApprovedEvent, ManagedEvent, UserPagination } from '../types/admin';
import type { Users } from '../types/users';

type PendingEventListResponse = PaginatedResponse<PendingEvent, 'pendingEvents'>;
type ApprovedEventListResponse = PaginatedResponse<ApprovedEvent, 'approvedEvents'>;
type ManagedEventListResponse = PaginatedResponse<ManagedEvent, 'events'>;

// (GET) 관리자 대시보드 정보 조회
export const getAdminDashboard = async (): Promise<AdminDashboard> => {
    const { data } = await axiosInstance.get<AdminDashboard>('/admin/dashboard');
    return data;
};

// (GET) 승인 대기 중인 행사 목록 조회
export const getPendingEvents = async (params: {
    page: number;
    limit: number;
}): Promise<PendingEventListResponse> => {
    const { data } = await axiosInstance.get<PendingEventListResponse>('/admin/pending-list', { params });
    return data;
};

// (GET) 승인 완료된 행사 목록 조회
export const getApprovedEvents = async (params: {
    page: number;
    limit: number;
}): Promise<ApprovedEventListResponse> => {
    const { data } = await axiosInstance.get<ApprovedEventListResponse>('/admin/approved-list', { params });
    return data;
};

// (GET) 관리해야 할 전체 행사 목록 조회
export const getManagedEvents = async (params: {
    page: number;
    limit: number;
}): Promise<ManagedEventListResponse> => {
    const { data } = await axiosInstance.get<ManagedEventListResponse>('/admin/events-list', { params });
    return data;
};



// (GET) 사용자 목록 조회 (필터: user_id, role)
export const getUsers = async (params?: {
  page?: number;
  per_page?: number;
  user_id?: string;
  role?: string;
}): Promise<{ users: Users[]; pagination: UserPagination; filters: any }> => {
  const { data } = await axiosInstance.get('/admin/users', { params });
  return data;
};

/** (PUT) 사용자 역할(role) 변경
 *  예: updateUserRole(3, 'admin')
 */
export const updateUserRole = async (userId: number, role: string): Promise<{ message: string; user: Users }> => {
  const { data } = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
  return data;
};

/** (DELETE) 사용자 삭제
 *  예: deleteUser(5)
 */
export const deleteUser = async (userId: number): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/admin/users/${userId}`);
  return data;
};