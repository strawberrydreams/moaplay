import { useState, useEffect, useCallback } from 'react';
import * as AuthApi from '../services/authApi';
import * as SchedulesApi from '../services/schedulesApi';
import * as UserApi from '../services/usersApi';
import type { LoginPayload } from '../types/auth';
import type { Users } from '../types/users';
import type { Schedule } from '../types/schedules';

export type AuthenticatedUser = Users;

export function useAuth() {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [schedulesLoading, setSchedulesLoading] = useState(false);

    /** 찜 목록 새로고침 */
    const fetchSchedules = useCallback(async () => {
        setSchedulesLoading(true);
        try {
            const response = await SchedulesApi.getSchedules();
            const fetched = response.schedules || [];
            setSchedules(fetched);
            localStorage.setItem('schedules', JSON.stringify(fetched));
        } catch (err) {
            console.error('찜 목록 로딩 실패:', err);
            setSchedules([]);
            localStorage.removeItem('schedules');
        } finally {
            setSchedulesLoading(false);
        }
    }, []);

    /** 인증 상태 확인 */
    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = await UserApi.getMe();
            if (userData?.id && userData.user_id) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                await fetchSchedules();
            } else {
                setUser(null);
                localStorage.removeItem('user');
                setSchedules([]);
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                setUser(null);
                localStorage.removeItem('user');
                setSchedules([]);
                localStorage.removeItem('schedules');
            } else {
                console.error('인증 상태 확인 실패:', err);
                setError('로그인 상태 확인 중 오류 발생');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, [fetchSchedules]);

    /** 앱 최초 실행 시 저장된 로그인 정보 복원 */
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedSchedules = localStorage.getItem('schedules');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        if (savedSchedules) {
            setSchedules(JSON.parse(savedSchedules));
        }
        checkAuthStatus();
    }, [checkAuthStatus]);

    /** 로그인 */
    const login = useCallback(
        async (credentials: LoginPayload) => {
            setLoading(true);
            setError(null);
            try {
                const userId = await AuthApi.loginUser(credentials);
                if (userId?.id && userId.user_id) {
                    const userData = await UserApi.getMe();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    sessionStorage.setItem('active_tab', 'true'); // 현재 탭 활성
                    await fetchSchedules();
                    return userData;
                } else {
                    throw new Error('로그인 실패: 서버 응답 확인 필요');
                }
            } catch (err: any) {
                const serverError =
                    err.response?.data?.error || '아이디 또는 비밀번호를 확인해주세요.';
                setError(serverError);
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('schedules');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [fetchSchedules]
    );

    /** 로그아웃 */
    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await AuthApi.logoutUser();
            setUser(null);
            setSchedules([]);
            localStorage.removeItem('user');
            localStorage.removeItem('schedules');
            sessionStorage.removeItem('active_tab');
            window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: null })); // 다른 탭 동기화
            window.location.reload();
        } catch (err) {
            console.error('로그아웃 API 실패:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /** 🔁 탭 간 로그인/로그아웃 동기화 */
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'user') {
                const updatedUser = event.newValue ? JSON.parse(event.newValue) : null;
                setUser(updatedUser);
                if (!updatedUser) {
                    setSchedules([]);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    /** 모든 탭 닫힘 감지 → 자동 로그아웃 */
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('active_tab');
            setTimeout(() => {
                //  다른 탭 중 active_tab이 없으면 자동 로그아웃 처리
                const otherTabsActive = sessionStorage.length > 0;
                if (!otherTabsActive) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('schedules');
                }
            }, 500);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return {
        user,
        loading,
        error,
        schedules,
        schedulesLoading,
        login,
        logout,
        checkAuthStatus,
        fetchSchedules,
    };
}
