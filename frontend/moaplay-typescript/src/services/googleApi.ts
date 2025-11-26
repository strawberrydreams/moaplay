// src/services/googleApi.ts
import axiosInstance from './core/axios';

// 백엔드에서 반환하는 이벤트 형태에 맞춘 타입
export interface GoogleEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end?: string;  // ISO string (없을 수도 있음)
}

// 일정 생성할 때 보낼 payload 타입
export interface CreateGoogleEventPayload {
  localEventId: number;
  title: string;
  start: string; // new Date().toISOString() 이런 형식
  end?: string;
}

const googleApi = {
  /**
   * 현재 로그인한 유저의 구글 캘린더 이벤트 목록 가져오기
   * GET /api/google/events
   */
  async getEvents(): Promise<GoogleEvent[] | unknown> {
    const res = await axiosInstance.get<GoogleEvent[]>("/google/events");
    return res.data;
  },

  /**
   * 구글 캘린더에 새 이벤트 생성
   * POST /api/google/events
   */
  async createEvent(payload: CreateGoogleEventPayload): Promise<GoogleEvent> {
    const res = await axiosInstance.post<GoogleEvent>("/google/events", payload);
    return res.data;
  },

  /**
   * 구글 캘린더 이벤트 삭제
   * DELETE /api/google/events/:eventId
   */
  async deleteEvent(eventId: string): Promise<void> {
    await axiosInstance.delete(`/google/events/${eventId}`);
  },

  /**
   * 구글 연동이 되어 있는지 간단히 체크 (선택사항)
   *  - 200: 연동됨
   *  - 401: 연동 안 됨
   */
  async isLinked(): Promise<boolean> {
    try {
      await axiosInstance.get("/google/events", { params: { limit: 1 } });
      return true;
    } catch (err: any) {
      if (err?.response?.status === 401) return false;
      throw err;
    }
  },

  checkConnected: async () => {
    const res = await axiosInstance.get("/google/status", {
      withCredentials: true,
    });
    return res.data; // { connected: true/false }
  },
};

export default googleApi;
