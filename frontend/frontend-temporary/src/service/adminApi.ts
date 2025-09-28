import axiosInstance from './core';
import type { PaginatedResponse } from '../types';
import type { AdminDashboard, PendingEvent, ApprovedEvent, ManagedEvent } from '../types/admin';

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
