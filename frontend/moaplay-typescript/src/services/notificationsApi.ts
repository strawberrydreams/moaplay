import axiosInstance from './core/axios';
import type { Users } from '../types/users';
import type { NotificationListResponse } from '../types/notifications';

/** (POST) 알림 발송
 *  주최자가 자신이 등록한 행사에 대해 사용자들에게 알림 전송
 *  예: sendNotification({ event_id: 5, title: '일정 변경 안내', message: '행사 시간이 변경되었습니다', type: 'info' })
 */
export const sendNotification = async (payload: {
  event_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
}): Promise<Notification> => {
    const { data } = await axiosInstance.post<Notification>('/notifications/', payload);
    return data;
};

/** (GET) 내 알림 목록 조회
 *  예: getMyNotifications({ page: 1, per_page: 10, is_read: 'false' })
 */
export const getMyNotifications = async (params?: {
  page?: number;
  per_page?: number;
  is_read?: 'true' | 'false';
}): Promise<NotificationListResponse> => {
  const { data } = await axiosInstance.get<NotificationListResponse>('/notifications/my', { params });
  return data;
};

/** (PUT) 특정 알림 읽음 처리
 *  예: markNotificationAsRead(12)
 */
export const markNotificationAsRead = async (
  recipientId: number
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.put<{ message: string }>(`/notifications/${recipientId}/read`);
  return data;
};

/** (DELETE) 알림 삭제
 *  예: deleteNotification(5)
 */
export const deleteNotification = async (
  notificationId: number
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete<{ message: string }>(`/notifications/${notificationId}`);
  return data;
};

/** (GET) SSE 실시간 알림 스트림 구독
 *  사용 예:
 *  const eventSource = listenNotifications();
 *  eventSource.onmessage = (e) => console.log(JSON.parse(e.data));
 */
export const listenNotifications = (): EventSource => {
  const eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/notifications/stream`, {
    withCredentials: true,
  } as any);
  return eventSource;
};