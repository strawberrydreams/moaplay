import { useState, useCallback } from 'react';

import { type AdminDashboard, type UserPagination } from '../types/admin';
import type { Event } from '../types/events';
import type { Users } from '../types/users';
import type { Pagination } from '../types/index';
import { getAdminDashboard, getApprovedEvents, getPendingEvents, getUsers } from "../services/adminApi";
import { updateEventStatus } from "../services/eventsApi";

interface UseAdminDashboardReturn {
    // 대시보드 통계
    stats: AdminDashboard | null;
    statsLoading: boolean;
    statsError: string | null;

    // 승인 대기 행사
    pendingEvents: Event[];
    pendingEventsLoading: boolean;
    pendingEventsError: string | null;
    pendingEventsPagination: Pagination | null;

    // 승인된 행사
    approvedEvents: Event[];
    approvedEventsLoading: boolean;
    approvedEventsError: string | null;
    approvedEventsPagination: Pagination | null;

    // 사용자 목록
    users: Users[];
    usersLoading: boolean;
    usersError: string | null;
    usersPagination: UserPagination | null;

    // 액션 함수들
    refreshStats: () => Promise<void>;
    loadPendingEvents: (page?: number) => Promise<void>;
    loadApprovedEvents: (page?: number) => Promise<void>;
    approveEvent: (eventId: number) => Promise<void>;
    rejectEvent: (eventId: number, reason: string) => Promise<void>;
}

// 관리자 대시보드 후크
export const useAdminDashboard = (): UseAdminDashboardReturn => {
    // 대시보드 통계 상태
    const [stats, setStats] = useState<AdminDashboard | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);

    // 승인 대기 행사 상태
    const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
    const [pendingEventsLoading, setPendingEventsLoading] = useState(false);
    const [pendingEventsError, setPendingEventsError] = useState<string | null>(null);
    const [pendingEventsPagination, setPendingEventsPagination] = useState<Pagination | null>(null);

    // 승인된 행사 상태
    const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);
    const [approvedEventsLoading, setApprovedEventsLoading] = useState(false);
    const [approvedEventsError, setApprovedEventsError] = useState<string | null>(null);
    const [approvedEventsPagination, setApprovedEventsPagination] = useState<Pagination | null>(null);

    // 사용자 목록
    const [users, setUsers] = useState<Users[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [usersPagination, setUsersPagination] = useState<UserPagination | null>(null);

    // 대시보드 응답 형식 정규화
    const toAdminDashboardStats = (resp: unknown): AdminDashboard => {
        const data = resp as any;

        return {
            totalEvents: data?.total_events ?? 0,
            approvedEvents: data?.approved_events ?? 0,
            pendingEvents: data?.pending_events ?? 0,
            totalUsers: data?.statistics?.users?.total ?? 0,
        };
    };

    // 대시보드 새로고침
    const refreshStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            setStatsError(null);

            const dashboardStats = await getAdminDashboard();
            console.log(dashboardStats.totalUsers);
            setStats(toAdminDashboardStats(dashboardStats));
        } catch (error) {
            console.error('대시보드 통계 조회 실패:', error);
            setStatsError('대시보드 통계를 불러오는데 실패했습니다.');
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // 승인 대기 행사 목록
    const loadPendingEvents = useCallback(async (page: number = 1) => {
        try {
            setPendingEventsLoading(true);
            setPendingEventsError(null);

            const result = await getPendingEvents({ page, limit: 20 });
            const resultData = result as any;
            setPendingEvents(resultData?.items ?? resultData?.events ?? []);
            setPendingEventsPagination(resultData?.pagination ?? null);
        } catch (error) {
            console.error('승인 대기 행사 조회 실패:', error);
            setPendingEventsError('승인 대기 행사를 불러오는데 실패했습니다.');
        } finally {
            setPendingEventsLoading(false);
        }
    }, []);

    // 승인된 행사 목록
    const loadApprovedEvents = useCallback(async (page: number = 1) => {
        try {
            setApprovedEventsLoading(true);
            setApprovedEventsError(null);

            const result = await getApprovedEvents({ page, limit: 20 });

            // Narrow unknown → known structure
            type EventsPageResp = {
                items?: Event[];
                events?: Event[];
                pagination?: Pagination | null;
            };

            const data = result as unknown as EventsPageResp;
            const list = Array.isArray(data.items)
                ? data.items
                : Array.isArray(data.events)
                    ? data.events
                    : [];

            setApprovedEvents(list);
            setApprovedEventsPagination(data.pagination ?? null);
        } catch (error) {
            console.error('승인된 행사 조회 실패:', error);
            setApprovedEventsError('승인된 행사를 불러오는데 실패했습니다.');
        } finally {
            setApprovedEventsLoading(false);
        }
    }, []);

    // 행사 승인
    const approveEvent = useCallback(async (eventId: number) => {
        try {
            await updateEventStatus(eventId, { status: 'approved' });

            // 승인 후 목록 새로고침
            await Promise.all([
                refreshStats(),
                loadPendingEvents(),
                loadApprovedEvents(),
            ]);

            console.log('행사가 성공적으로 승인되었습니다.');
        } catch (error) {
            console.error('행사 승인 실패:', error);
            throw new Error('행사 승인에 실패했습니다.');
        }
    }, [refreshStats, loadPendingEvents, loadApprovedEvents]);

    // 행사 거절
    const rejectEvent = useCallback(async (eventId: number) => {
        try {
            await updateEventStatus(eventId, { status: 'rejected' });

            // 거절 후 목록 새로고침
            await Promise.all([refreshStats(), loadPendingEvents()]);

            console.log('행사가 성공적으로 거절되었습니다.');
        } catch (error) {
            console.error('행사 거절 실패:', error);
            throw new Error('행사 거절에 실패했습니다.');
        }
    }, [refreshStats, loadPendingEvents]);

    // 사용자 목록 조회 (role, user_id 필터 + pagination)
    const loadUsers = useCallback(
        async (page: number = 1, role?: string, userId?: string) => {
        try {
            setUsersLoading(true);
            setUsersError(null);

            const params = {
            page,
            per_page: 10,
            role: role || undefined,
            user_id: userId?.trim() || undefined,
            };

            const result = await getUsers(params);
            setUsers(result.users ?? []);
            setUsersPagination(result.pagination ?? null);
        } catch (err) {
            console.error('사용자 목록 조회 실패:', err);
            setUsersError('사용자 목록을 불러오는데 실패했습니다.');
        } finally {
            setUsersLoading(false);
        }
        },
        []
    );

    return {
        // 대시보드 통계
        stats,
        statsLoading,
        statsError,

        // 승인 대기 행사
        pendingEvents,
        pendingEventsLoading,
        pendingEventsError,
        pendingEventsPagination,

        // 승인된 행사
        approvedEvents,
        approvedEventsLoading,
        approvedEventsError,
        approvedEventsPagination,

        // 회원
        users,
        usersLoading,
        usersError,
        usersPagination,

        // 액션 함수들
        refreshStats,
        loadPendingEvents,
        loadApprovedEvents,
        approveEvent,
        rejectEvent,
    };
};