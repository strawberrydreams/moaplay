/**
 * Kakao OAuth 소셜 로그인 컴포넌트
 * 
 * Kakao OAuth를 사용한 소셜 로그인 기능을 제공합니다.
 * Kakao JavaScript SDK를 사용하여 구현됩니다.
 */

import React, { useEffect } from 'react';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../hooks';
import styled from 'styled-components';

/**
 * Kakao 인증 응답 객체 타입
 */
interface KakaoAuthResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

/**
 * Kakao SDK Auth 인터페이스
 */
interface KakaoAuth {
  login: (options: {
    success: (authObj: KakaoAuthResponse) => void;
    fail: (err: unknown) => void;
  }) => void;
  logout: (callback?: () => void) => void;
}

/**
 * Kakao SDK 인터페이스
 */
interface KakaoSDK {
  init: (appKey: string) => void;
  isInitialized: () => boolean;
  Auth: KakaoAuth;
}

/**
 * Kakao SDK 전역 타입 선언
 */
declare global {
  interface Window {
    Kakao: KakaoSDK;
  }
}

/**
 * Kakao OAuth 로그인 컴포넌트 Props
 */
interface KakaoOAuthProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Kakao OAuth 로그인 컴포넌트
 * 
 * Kakao 계정을 사용한 소셜 로그인 버튼을 제공합니다.
 * 로그인 성공 시 JWT 토큰을 받아 인증 상태를 업데이트합니다.
 */
export const KakaoOAuth: React.FC<KakaoOAuthProps> = ({
  onSuccess,
  onError
}) => {
  const { refreshUser } = useAuth();

  /**
   * Kakao SDK 초기화
   */
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoClientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
      if (kakaoClientId) {
        window.Kakao.init(kakaoClientId);
      } else {
        console.error('Kakao Client ID가 설정되지 않았습니다.');
      }
    }
  }, []);

  /**
   * Kakao 로그인 처리
   * 
   * Kakao SDK를 사용하여 로그인을 시도합니다.
   * 성공 시 받은 액세스 토큰을 백엔드로 전송하여 JWT 토큰을 받습니다.
   */
  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      const error = new Error('Kakao SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      console.error('Kakao 로그인 실패:', error);
      onError?.(error);
      return;
    }

    window.Kakao.Auth.login({
      success: async (authObj: KakaoAuthResponse) => {
        try {
          if (!authObj.access_token) {
            throw new Error('Kakao 액세스 토큰을 받지 못했습니다.');
          }

          // Kakao OAuth 토큰으로 백엔드 로그인 요청
          const tokens = await AuthService.kakaoLogin(authObj.access_token);
          
          // 토큰 저장
          if (tokens.access_token != null) {
            localStorage.setItem('accessToken', tokens.access_token);
          }
          if (tokens.refresh_token != null) {
            localStorage.setItem('refreshToken', tokens.refresh_token);
          }
          
          // 사용자 정보 새로고침
          await refreshUser();
          
          // 성공 콜백 호출 (모달 닫기)
          onSuccess?.();
          
        } catch (error) {
          console.error('Kakao 로그인 실패:', error);
          const err = error instanceof Error 
            ? error 
            : new Error('Kakao 로그인 중 오류가 발생했습니다.');
          onError?.(err);
        }
      },
      fail: (err: unknown) => {
        const error = new Error('Kakao 로그인이 취소되었거나 실패했습니다.');
        console.error('Kakao 로그인 실패:', err);
        onError?.(error);
      }
    });
  };

  return (
    <KakaoLoginButton onClick={handleKakaoLogin}>
      <KakaoIcon>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 0C4.032 0 0 3.204 0 7.155c0 2.52 1.656 4.734 4.176 6.048l-1.08 3.96c-.072.27.216.486.432.324L7.92 15.12c.36.036.72.054 1.08.054 4.968 0 9-3.204 9-7.155S13.968 0 9 0z"
            fill="currentColor"
          />
        </svg>
      </KakaoIcon>
      카카오로 로그인
    </KakaoLoginButton>
  );
};

const KakaoLoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: #fee500;
  color: #000000;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fdd835;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #999999;
    cursor: not-allowed;
    transform: none;
  }
`;

const KakaoIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;