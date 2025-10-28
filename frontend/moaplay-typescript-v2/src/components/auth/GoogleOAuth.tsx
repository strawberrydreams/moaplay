/**
 * Google OAuth 소셜 로그인 컴포넌트
 * 
 * Google OAuth를 사용한 소셜 로그인 기능을 제공합니다.
 * @react-oauth/google 라이브러리를 사용하여 구현됩니다.
 */

import React, { useRef, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { AuthService } from '../../services/authService';

/**
 * Google OAuth 컴포넌트 Props
 */
interface GoogleOAuthProps {
  /** 로그인 성공 시 호출되는 콜백 */
  onSuccess?: () => void;
  /** 로그인 실패 시 호출되는 콜백 */
  onError?: (error: Error) => void;
}

/**
 * Google OAuth 로그인 컴포넌트
 * 
 * Google 계정을 사용한 소셜 로그인 버튼을 제공합니다.
 * 로그인 성공 시 JWT 토큰을 받아 로컬 스토리지에 저장하고 인증 상태를 업데이트합니다.
 * 
 * @param onSuccess - 로그인 성공 시 호출되는 콜백 함수
 * @param onError - 로그인 실패 시 호출되는 콜백 함수
 */
export const GoogleOAuth: React.FC<GoogleOAuthProps> = ({
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  /**
   * Google 로그인 성공 처리
   * 
   * Google에서 받은 credential을 백엔드로 전송하여 JWT 토큰을 받습니다.
   * 토큰을 로컬 스토리지에 저장하고 성공 콜백을 호출합니다.
   */
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    // 중복 요청 방지
    if (inFlightRef.current) return;
    
    try {
      const credential = credentialResponse?.credential;
      if (!credential) {
        const err = new Error('Google 인증 정보를 받지 못했습니다.');
        onError?.(err);
        console.error(err.message);
        return;
      }
      
      inFlightRef.current = true;
      setLoading(true);

      // 백엔드 API 호출하여 JWT 토큰 받기
      const tokens = await AuthService.googleLogin(credential);
      
      // 토큰 저장
      if (tokens.access_token != null) {
        localStorage.setItem('accessToken', tokens.access_token);
      }
      if (tokens.refresh_token != null) {
        localStorage.setItem('refreshToken', tokens.refresh_token);
      }

      // 성공 콜백 호출 (모달 닫기 및 사용자 정보 갱신)
      onSuccess?.();
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Google 로그인 중 오류가 발생했습니다.');
      onError?.(err);
      console.error('Google 로그인 실패:', err.message);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  /**
   * Google 로그인 실패 처리
   * 
   * 사용자가 로그인을 취소하거나 오류가 발생한 경우 호출됩니다.
   */
  const handleGoogleError = () => {
    const err = new Error('Google 로그인이 취소되었거나 실패했습니다.');
    onError?.(err);
    console.error(err.message);
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Google Client ID가 설정되지 않은 경우 안내 메시지 표시
  if (!clientId) {
    console.warn('Google Client ID가 설정되지 않았습니다.');
    return (
      <div style={{ opacity: 0.6, padding: '12px', textAlign: 'center' }}>
        Google 로그인 설정이 필요합니다. 관리자에게 문의하세요.
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={loading ? { pointerEvents: 'none', opacity: 0.8 } : undefined}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text="signin_with"
          shape="rectangular"
          theme="outline"
          locale="ko"
        />
      </div>
    </GoogleOAuthProvider>
  );
};