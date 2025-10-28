/**
 * 인증 Context
 * 
 * 애플리케이션 전체에서 사용자 인증 상태를 공유합니다.
 * useAuth 훅을 Context 기반으로 변경하여 상태 동기화 문제를 해결합니다.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { UserMeResponse, UserSignupRequest } from '../types/users';
import { UserNormalizer, MyProfileViewModel } from '../normalizers/userNormalizer';

/**
 * AuthContext 타입
 */
interface AuthContextType {
  user: MyProfileViewModel | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user_id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: UserSignupRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * AuthContext 생성
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider 컴포넌트
 * 
 * 애플리케이션 전체에 인증 상태를 제공합니다.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MyProfileViewModel | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 현재 사용자 정보 갱신
   */
  const refreshUser = useCallback(async () => {
    try {
      console.log('[AuthContext] Fetching current user info...');
      const currentUser: UserMeResponse = await AuthService.getCurrentUser();
      console.log('[AuthContext] Current user fetched:', currentUser.user_id);
      
      const normalizedUser = UserNormalizer.toMyProfileViewModel(currentUser);
      console.log('[AuthContext] Normalized user:', {
        id: normalizedUser.id,
        userId: normalizedUser.userId,
        nickname: normalizedUser.nickname,
        role: normalizedUser.role
      });
      setUser(normalizedUser);
      
      // 토큰이 있다면 저장
      const storedToken = localStorage.getItem('accessToken');
      setToken(storedToken);
      
      console.log('[AuthContext] User state updated successfully');
    } catch (error) {
      console.error('[AuthContext] Failed to fetch user info:', error);
      // 인증 실패 시 사용자 정보 초기화
      setUser(null);
      setToken(null);
    } finally {
      console.log('[AuthContext] Setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  /**
   * 컴포넌트 마운트 시 사용자 정보 로드
   */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * 로그인
   */
  const login = async (user_id: string, password: string) => {
    try {
      const response = await AuthService.login({ user_id, password });
      
      // 토큰 저장
      if (response?.access_token) {
        localStorage.setItem('accessToken', response.access_token);
        setToken(response.access_token);
      }
      if (response?.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      
      // 사용자 정보 갱신
      console.log('[AuthContext] Refreshing user info after login...');
      await refreshUser();
      console.log('[AuthContext] User info refreshed successfully');
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      // 로그인 실패 시 토큰 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  /**
   * 로그아웃
   */
  const logout = async () => {
    await AuthService.logout();
    
    // 로컬 스토리지의 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 사용자 정보 초기화
    setUser(null);
    setToken(null);
  };

  /**
   * 회원가입
   */
  const signup = async (data: UserSignupRequest) => {
    await AuthService.signup(data);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth 훅
 * 
 * AuthContext를 사용하여 인증 상태에 접근합니다.
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};