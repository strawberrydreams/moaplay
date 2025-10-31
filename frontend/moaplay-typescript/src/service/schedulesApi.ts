import axiosInstance from './core/axios';
import type { SchedulesResponse,ScheduleCreationResponse } from '../types/schedules';

// (GET) 사용자의 모든 일정 목록 조회
export const getSchedules = async (): Promise<SchedulesResponse> => {
    const { data } = await axiosInstance.get<SchedulesResponse>('/schedules');
    return data;
};

// (POST) 사용자의 일정에 새로운 행사 추가
export const addSchedule = async (event_id: number): Promise<ScheduleCreationResponse> => {
    const { data } = await axiosInstance.post<ScheduleCreationResponse>('/schedules', { event_id });
    return data;
};

// (DELETE) 사용자의 일정에서 특정 행사 삭제
export const deleteSchedule = async (schedule_id: number): Promise<void> => {
    await axiosInstance.delete(`/schedules/${schedule_id}`);
};
