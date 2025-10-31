import axiosInstance from './core/axios';
import type * as E from '../types/events';

// eventApi.ts 전용 Response 타입을 추가 정의

// (GET) 모든 행사 목록 조회 (페이지네이션)
export const getEvents = async (params : E.GetEventsPayload): Promise<E.Event[]> => {
    const { data } = await axiosInstance.get<E.Event[]>('/events', {params: params});
    return data;
};

// (GET) 특정 ID의 행사 상세 정보 조회
export const getEventById = async (id: number): Promise<E.Event> => {
    const { data } = await axiosInstance.get<E.Event>(`/events/${id}`);
    return data;
};

// (POST) 새로운 행사 등록 & 신청
export const createEvent = async (payload: Partial<E.CreateEventPayload>): Promise<Event> => {
    const { data } = await axiosInstance.post<Event>('/events', payload);
    return data;
};

// (PUT) 특정 ID의 행사 정보 수정
export const updateEvent = async (id: number, payload: Partial<E.CreateEventPayload>): Promise<Event> => {
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
    payload: E.UpdateEventStatusPayload
): Promise<E.EventStatusUpdateResponse> => {
    const { data } = await axiosInstance.put<E.EventStatusUpdateResponse>(`/events/${id}/status`, payload);
    return data;
};