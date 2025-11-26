import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
// 1. useAuth 훅과 훅이 반환하는 사용자 타입을 임포트합니다.
import { useAuth, type AuthenticatedUser } from '../hooks/useAuth';
// 2. 찜(스케줄) 타입도 임포트합니다 (useAuth가 반환하므로).
import type { Schedule } from '../types/schedules';

// 3. Context가 제공할 값들의 타입을 정의합니다.
// (useAuth 훅의 반환 타입과 일치시킵니다)
interface AuthContextType {
    user: AuthenticatedUser | null;
    loading: boolean; // 전체 인증 로딩
    error: string | null;
    schedules: Schedule[]; // 찜 목록
    schedulesLoading: boolean; // 찜 목록 로딩
    login: (credentials: any) => Promise<AuthenticatedUser>; // (LoginPayload 타입 사용 권장)
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    fetchSchedules: () => Promise<void>; // 찜 목록 새로고침
    isGoogleConnected: boolean;
    fetchGoogleStatus: () => Promise<void>;
}

// 4. Context를 생성합니다. (초기값은 undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider: 앱 전체에 인증 상태와 함수들을 제공하는 컴포넌트
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 5. useAuth 훅을 호출하여 실제 로직과 상태를 가져옵니다.
    const auth = useAuth();

    // 6. useMemo를 사용해 Provider의 value를 최적화합니다.
    //    auth 훅의 주요 상태/함수 참조가 변경될 때만 value 객체가 새로 생성됩니다.
    const value = useMemo(() => ({
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        schedules: auth.schedules,
        schedulesLoading: auth.schedulesLoading,
        isGoogleConnected: auth.isGoogleConnected,
        login: auth.login,
        logout: auth.logout,
        checkAuthStatus: auth.checkAuthStatus,
        fetchSchedules: auth.fetchSchedules,
        fetchGoogleStatus: auth.fetchGoogleStatus,
    }), [
        auth.user, auth.loading, auth.error,
        auth.schedules, auth.schedulesLoading,
        auth.isGoogleConnected,
        auth.login, 
        auth.logout, 
        auth.checkAuthStatus, 
        auth.fetchSchedules,
        auth.fetchGoogleStatus
    ]);

    // 7. Provider로 자식 컴포넌트들을 감싸고 value를 전달합니다.
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuthContext: 다른 컴포넌트에서 쉽게 Context 값에 접근하기 위한 커스텀 훅
 */
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Provider로 감싸지지 않은 곳에서 호출 시 에러 발생
        throw new Error('useAuthContext는 AuthProvider 안에서 사용해야 합니다.');
    }
    return context;
};