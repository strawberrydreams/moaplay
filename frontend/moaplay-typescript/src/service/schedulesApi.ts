import axiosInstance from './core';
import type { Schedule, ScheduleCreationResponse, CreateSchedulePayload } from '../types/schedules';

// (GET) 사용자의 모든 일정 목록 조회
export const getSchedules = async (): Promise<{ schedules: Schedule[] }> => {
    const { data } = await axiosInstance.get<{ schedules: Schedule[] }>('/schedules');
    return data;
};

// (POST) 사용자의 일정에 새로운 행사 추가
export const addSchedule = async (payload: CreateSchedulePayload): Promise<ScheduleCreationResponse> => {
    const { data } = await axiosInstance.post<ScheduleCreationResponse>('/schedule', payload);
    return data;
};

// (DELETE) 사용자의 일정에서 특정 행사 삭제
export const deleteSchedule = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/schedule/${id}`);
};
