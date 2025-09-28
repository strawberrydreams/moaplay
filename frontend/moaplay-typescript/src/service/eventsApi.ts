import axiosInstance from './core';
import type { PaginatedResponse } from '../types';
import type { Event, EventSummary, CreateEventPayload, UpdateEventPayload, UpdateEventStatusPayload } from '../types/events';

// eventApi.ts 전용 Response 타입을 추가 정의
interface EventStatusUpdateResponse {
    id: number;
    title: string;
    status: 'approved' | 'rejected';
    approved_at: string | null;
    approved_by: number | null;
    rejection_reason: string | null;
}

type EventListResponse = PaginatedResponse<EventSummary, 'events'>;

// (GET) 모든 행사 목록 조회 (페이지네이션)
export const getEvents = async (params: { page: number; limit: number }): Promise<EventListResponse> => {
    const { data } = await axiosInstance.get<EventListResponse>('/events', { params });
    return data;
};

// (GET) 특정 ID의 행사 상세 정보 조회
export const getEventById = async (id: number): Promise<Event> => {
    const { data } = await axiosInstance.get<Event>(`/events/${id}`);
    return data;
};

// (POST) 새로운 행사 등록 & 신청
export const createEvent = async (payload: CreateEventPayload): Promise<Event> => {
    const { data } = await axiosInstance.post<Event>('/events', payload);
    return data;
};

// (PUT) 특정 ID의 행사 정보 수정
export const updateEvent = async (id: number, payload: UpdateEventPayload): Promise<Event> => {
    const { data } = await axiosInstance.put<Event>(`/events/${id}`, payload);
    return data;
};

// (DELETE) 특정 ID의 행사 삭제
export const deleteEvent = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/events/${id}`);
};

// (PUT) 관리자가 행사 상태 변경 (승인/거절)
export const updateEventStatus = async (
    id: number,
    payload: UpdateEventStatusPayload
): Promise<EventStatusUpdateResponse> => {
    const { data } = await axiosInstance.put<EventStatusUpdateResponse>(`/events/${id}/status`, payload);
    return data;
};
