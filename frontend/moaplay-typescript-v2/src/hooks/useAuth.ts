/**
 * 인증 관련 커스텀 훅
 * 
 * AuthContext를 사용하여 인증 상태에 접근합니다.
 * 이제 전역 상태를 사용하므로 모든 컴포넌트에서 동일한 인증 상태를 공유합니다.
 */

import { useAuthContext } from '../contexts';
import { MyProfileViewModel } from '../normalizers/userNormalizer';
import { UserSignupRequest } from '../types/users';

/**
 * useAuth 훅 반환 타입
 */
export interface UseAuthReturn {
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
 * 인증 관련 커스텀 훅
 * 
 * AuthContext를 사용하여 전역 인증 상태에 접근합니다.
 * 모든 컴포넌트에서 동일한 인증 상태를 공유하므로 상태 동기화 문제가 해결됩니다.
 * 
 * @returns 인증 상태와 인증 관련 함수들
 */
export const useAuth = (): UseAuthReturn => {
  return useAuthContext();
};
