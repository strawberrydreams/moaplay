import { useState, useEffect, useCallback } from 'react';
import * as AuthApi from '../services/authApi'; // authApi.ts 경로 확인
import * as SchedulesApi from '../services/schedulesApi'; // schedulesApi.ts 경로 확인
import type { LoginPayload, LoginResponse } from '../types/auth'; // API 타입
import type { Users } from '../types/users'; // API 타입
import * as UserApi from '../services/usersApi'; // userApi.ts 경로 확인
import type { Schedule } from '../types/schedules'; // Schedule 타입

// 훅이 관리할 사용자 타입 (UserResponse와 동일)
export type AuthenticatedUser = Users; 

export function useAuth() {
  // 인증 상태
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // 앱 첫 로드 시 true
  const [error, setError] = useState<string | null>(null);
  
  // 찜(스케줄) 상태
  const [schedules, setSchedules] = useState<Schedule[]>([]); 
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(false); // 찜 목록 로딩

  // --- 찜 목록 새로고침 함수 ---
  // (useCallback으로 감싸서 login, checkAuthStatus에서 재사용)
  const fetchSchedules = useCallback(async () => {
    // 1. 찜 목록 로딩 시작
    setSchedulesLoading(true);
    try {
      // 2. 찜 API 호출
      const response = await SchedulesApi.getSchedules(); 
      setSchedules(response.schedules || []);
    } catch (scheduleError) {
      console.error("찜 목록 로딩 실패 (useAuth):", scheduleError);
      setSchedules([]); // 에러 시 빈 배열
    } finally {
      // 3. 찜 목록 로딩 종료
      setSchedulesLoading(false);
    }
  }, []); // 의존성 배열 비움

  // --- 앱 시작 시 로그인 상태 확인 ---
  const checkAuthStatus = useCallback(async () => {
    setLoading(true); // 전체 로딩 시작
    setError(null);
    try {
      // 1. /api/users/me 호출 (httpOnly 쿠키가 자동으로 전송됨)
      const userData = await UserApi.getMe(); 
      if (userData?.id && userData.user_id) {
        setUser(userData); // 2. 유저 상태 설정
        await fetchSchedules(); // 3. 찜 목록 불러오기
      } else {
        // (이 경우는 거의 없지만) 응답이 비정상이면 로그아웃 처리
        setUser(null);
        setSchedules([]);
      }
    } catch (err: any) {
      // 401(비로그인)은 정상, 조용히 처리
      if (err.response?.status === 401) {
        setUser(null);
        setSchedules([]);
      } else {
        // 401 외의 에러 (서버 다운 등)
        console.error("인증 상태 확인 실패:", err);
        setError("로그인 상태 확인 중 오류 발생");
        setUser(null);
        setSchedules([]);
      }
    } finally {
      setLoading(false); // 전체 로딩 종료
    }
  }, [fetchSchedules]); // fetchSchedules 함수에 의존

  // 5. 앱 첫 로드 시 checkAuthStatus 실행
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // --- 로그인 함수 ---
  const login = useCallback(async (credentials: LoginPayload) => {
    setLoading(true); // (전체 로딩 또는 로그인 로딩 상태)
    setError(null);
    try {
      // 1. 로그인 API 호출 (서버가 httpOnly 쿠키 설정)
      const userId = await AuthApi.loginUser(credentials); 
      if (userId?.id && userId.user_id) {
        const userData = await UserApi.getMe();
        setUser(userData); // 2. 유저 상태 설정
        await fetchSchedules(); // 3. 찜 목록 불러오기
        return userData;
      } else {
        throw new Error("로그인 실패: 서버 응답 확인 필요");
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error || '아이디 또는 비밀번호를 확인해주세요.';
      setError(serverError);
      setUser(null);
      setSchedules([]); // 실패 시 찜 목록 비우기
      throw err; // LoginForm으로 에러 다시 전달
    } finally {
      setLoading(false);
    }
  }, [fetchSchedules]); // fetchSchedules 함수에 의존

  // --- 로그아웃 함수 ---
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. 로그아웃 API 호출 (서버가 세션 파괴, 쿠키 삭제 응답)
      await AuthApi.logoutUser();
      setUser(null);
      setSchedules([]);
      window.location.reload(); // 페이지 새로고침
    } catch (err) {
      console.error("로그아웃 API 실패:", err);
      // 실패해도 로컬은 로그아웃 처리
    } finally {
      // 2. 모든 상태 초기화
      setUser(null); 
      setSchedules([]); 
      setLoading(false);
    }
  }, []);

  // 9. 훅이 관리하는 모든 상태와 함수들 반환
  return {
    user,
    loading,
    error,
    schedules,
    schedulesLoading,
    login,
    logout,
    checkAuthStatus,
    fetchSchedules
  };
}

