import { type Pagination } from "./index";

/** 알림 공통 타입 */
export interface Notification {
  id: number;
  event_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  sender: {
    id: number;
    nickname: string;
  };
  created_at: string;
}

export interface NotificationRecipient {
  id: number;
  user_id: number;
  notification_id: number;
  is_read: boolean;
  created_at: string;
  notification?: Notification;
}

export interface NotificationListResponse {
  notifications: NotificationRecipient[];
  unread_count: number;
  pagination: Pagination;
}