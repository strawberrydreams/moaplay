import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import * as NotificationApi from '../services/notificationsApi';
import { toast } from 'react-toastify';
import type { NotificationRecipient } from '../types/notifications';

// ---------------------------
// Context 타입 정의
// ---------------------------
interface NotificationsContextType {
    notifications: NotificationRecipient[]; // 알림 수신자 중심 구조
    unreadCount: number;
    markAsRead: (recipientId: number) => Promise<void>;
    clearNotifications: () => void;
    reloadNotifications: () => Promise<void>;
}

// ---------------------------
// Context 생성
// ---------------------------
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// ---------------------------
// Provider
// ---------------------------
interface NotificationsProviderProps {
    children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationRecipient[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);

    // 알림 목록 불러오기
    const loadNotifications = async () => {
        try {
            const data = await NotificationApi.getMyNotifications({ page: 1, per_page: 20 });
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error('알림 불러오기 실패:', err);
            toast.error('알림을 불러오지 못했습니다.');
        }
    };

    //  알림 읽음 처리
    const markAsRead = async (recipientId: number) => {
        try {
            await NotificationApi.markNotificationAsRead(recipientId);
            setNotifications((prev) =>
                prev.map((r) => (r.id === recipientId ? { ...r, is_read: true } : r))
            );
            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch (err) {
            console.error('알림 읽음 처리 실패:', err);
        }
    };

    // 전체 초기화 (로그아웃 등)
    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    // ✅ 4️⃣ SSE 실시간 알림 수신
    useEffect(() => {
        loadNotifications();

        const eventSource = NotificationApi.listenNotifications();

        eventSource.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                // 백엔드에서 보내는 건 Notification이므로 Recipient 형태로 감싸줌
                const newRecipient: NotificationRecipient = {
                    id: Date.now(), // SSE는 recipient_id를 포함하지 않으므로 임시 ID 부여
                    user_id: data.sent_by || 0,
                    notification_id: data.id,
                    is_read: false,
                    created_at: data.created_at,
                    notification: data, // 실제 Notification 객체 포함
                };

                setNotifications((prev) => [newRecipient, ...prev]);
                setUnreadCount((prev) => prev + 1);

                toast.info(`🔔 ${data.title}`, {
                    body: data.message,
                    autoClose: 3000,
                });
            } catch (error) {
                console.error('SSE 메시지 파싱 오류:', error);
            }
        };

        eventSource.onerror = (err) => {
            console.warn('SSE 연결 오류:', err);
            eventSource.close();
        };

        eventSourceRef.current = eventSource;

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                clearNotifications,
                reloadNotifications: loadNotifications,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

// ---------------------------
// 커스텀 훅
// ---------------------------
export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context)
        throw new Error('useNotifications must be used within NotificationsProvider');
    return context;
};
