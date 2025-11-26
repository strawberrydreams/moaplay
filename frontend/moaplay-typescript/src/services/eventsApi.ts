import axiosInstance from './core/axios';
import type * as E from '../types/events';

// eventApi.ts 전용 Response 타입을 추가 정의

// (GET) 모든 행사 목록 조회 (페이지네이션)
export const getEvents = async (params: E.GetEventsPayload) => {
    const query: any = { ...params };

    // 배열을 쉼표 문자열로 변환
    if (Array.isArray(params.tags) && params.tags.length > 0) {
        query.tags = params.tags.join(',');
    }

    const { data } = await axiosInstance.get('/events', { params: query });
    return data;
};

// (GET) 특정 ID의 행사 상세 정보 조회
export const getEventById = async (id: number): Promise<E.Event> => {
    const { data } = await axiosInstance.get<E.Event>(`/events/${id}`);
    return data;
};

// (POST) 새로운 행사 등록 & 신청
export const createEvent = async (payload: Partial<E.CreateEventPayload>): Promise<Event> => {
    const { data } = await axiosInstance.post<Event>('/events/', payload);
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

// (POST) 백엔드 API에 크롤링 작업을 요청
// 크롤링된 행사 데이터는 백엔드에서 정제 후 DB에 추가, 이후 일반 행사 데이터와 동일하게 취급
export const startCrawling = async (
    payload: E.StartCrawlingPayload
) => {
    return axiosInstance.post('/events/crawling', payload);
};