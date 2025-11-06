import { useEffect, useState, useCallback } from 'react';
import {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
  listenNotifications,
} from '../services/notificationsApi';
import { type NotificationRecipient,type Notification } from '../types/notifications';

interface UseNotificationsReturn {
  notifications: NotificationRecipient[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: (page?: number) => Promise<void>;
  markAsRead: (recipientId: number) => Promise<void>;
  removeNotification: (notificationId: number) => Promise<void>;
}

/**
 * 실시간 알림 + 내 알림 관리 훅
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationRecipient[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* 알림 목록 불러오기 */
  const refreshNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyNotifications({ page, per_page: 20 });
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('알림 불러오기 실패:', err);
      setError('알림을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* 알림 읽음 처리 */
  const markAsRead = useCallback(async (recipientId: number) => {
    try {
      await markNotificationAsRead(recipientId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === recipientId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  }, []);

  /** 알림 삭제 */
  const removeNotification = useCallback(async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.notification_id !== notificationId)
      );
    } catch (err) {
      console.error('알림 삭제 실패:', err);
    }
  }, []);

  /** SSE 실시간 스트림 구독 */
  useEffect(() => {
    const eventSource = listenNotifications();

    eventSource.onmessage = (event) => {
      try {
        const newNoti: Notification = JSON.parse(event.data);
        console.log('📨 새 알림 도착:', newNoti);

        setNotifications(prev => [
          { 
            id: newNoti.id,
            user_id: newNoti.sender.id,
            notification_id: newNoti.id,
            is_read: false,
            created_at: newNoti.created_at,
            notification: newNoti
          },
          ...prev
        ]);
        setUnreadCount(prev => prev + 1);
      } catch (err) {
        console.error('SSE 메시지 파싱 실패:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('🔌 SSE 연결 오류:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  /** 최초 로딩 */
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    removeNotification,
  };
};
