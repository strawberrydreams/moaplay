/**
 * 로그인 페이지 컴포넌트
 * 
 * 사용자 로그인 폼을 제공합니다.
 * 일반 로그인(아이디/비밀번호)과 소셜 로그인(Google, Kakao)을 지원합니다.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useAuthModal } from '../contexts';
import { FormInput } from '../components/common';
import { Button } from '../components/common';
import { GoogleOAuth } from '../components/auth';
import { KakaoOAuth } from '../components/auth';
import { validateLoginForm } from '../utils/validation';
import { FieldError } from '../types';
import {
  PageContainer,
  LoginContainer,
  LoginTitle,
  LoginForm,
  ErrorMessage,
  Divider,
  DividerLine,
  DividerText,
  SocialLoginSection,
  SignupSection,
  SignupText,
  SignupButton,
} from '../styles/components/LoginPage.styles';

/**
 * 로그인 폼 데이터 타입
 */
interface LoginFormData {
  user_id: string;
  password: string;
}

/**
 * API 에러 응답 타입
 */
interface ApiErrorResponse {
  response?: {
    data?: {
      error?: {
        message?: string;
        code?: string;
      };
    };
    status?: number;
  };
  message?: string;
}

/**
 * 로그인 페이지 컴포넌트
 *
 * 아이디/비밀번호를 통한 일반 로그인과 Google, Kakao를 통한 소셜 로그인을 제공합니다.
 * 폼 유효성 검사와 에러 처리를 포함합니다.
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { openSignupModal, closeModal } = useAuthModal();

  // 폼 상태 관리
  const [formData, setFormData] = useState<LoginFormData>({
    user_id: '',
    password: ''
  });

  // UI 상태 관리
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  /**
   * 폼 필드 값 변경 처리
   */
  const handleFieldChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // 일반 에러 메시지 제거
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * 폼 유효성 검사 및 에러 설정
   */
  const validateForm = (): boolean => {
    const validation = validateLoginForm(formData.user_id, formData.password);

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((error: FieldError) => {
        // 구 validator가 'username' 키를 반환할 수 있어 user_id로 매핑
        const key = error.field === 'username' ? 'user_id' : error.field;
        errorMap[key] = error.message;
      });
      setErrors(errorMap);
      return false;
    }

    setErrors({});
    return true;
  };

  /**
   * 일반 로그인 처리
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      console.log('[LoginPage] Attempting login...');
      // Auth API의 POST /api/auth/login 엔드포인트를 사용
      // LoginRequest 타입: { user_id: string, password: string }
      await login(
        formData.user_id,
        formData.password,
      );
      console.log('[LoginPage] Login successful, user info loaded');
      
      // 로그인 성공 후 모달 닫기
      console.log('[LoginPage] Closing modal...');
      closeModal();
      
      // 모달이 닫히는 애니메이션을 위한 짧은 지연
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 로그인 성공 후 원래 페이지로 돌아가기
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      console.log('[LoginPage] Redirect path:', redirectPath);
      
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectingToLogin');
        console.log('[LoginPage] Navigating to:', redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        console.log('[LoginPage] Navigating to home with fromLogin flag');
        // fromLogin 플래그를 설정하여 관리자 자동 리다이렉트 활성화
        navigate('/', { replace: true, state: { fromLogin: true } });
      }
    } catch (error: unknown) {
      console.error('로그인 실패:', error);

      // API 에러 응답 처리
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.error?.message
        || (error instanceof Error ? error.message : null)
        || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';

      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 소셜 로그인 성공 처리
   * 
   * 소셜 로그인 성공 시 모달을 닫고 메인 페이지로 이동합니다.
   * 사용자 정보는 각 OAuth 컴포넌트에서 이미 갱신되었습니다.
   */
  const handleSocialLoginSuccess = async () => {
    setGeneralError(''); // 에러 메시지 초기화
    
    // 소셜 로그인 성공 후 모달 닫기
    console.log('[LoginPage] Social login successful, closing modal...');
    closeModal();
    
    // 모달이 닫히는 애니메이션을 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 로그인 성공 후 원래 페이지로 돌아가기
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectingToLogin');
      navigate(redirectPath, { replace: true });
    } else {
      // fromLogin 플래그를 설정하여 관리자 자동 리다이렉트 활성화
      navigate('/', { replace: true, state: { fromLogin: true } });
    }
  };

  /**
   * 소셜 로그인 실패 처리
   * 
   * 소셜 로그인 실패 시 사용자에게 에러 메시지를 표시합니다.
   * 버튼은 활성 상태로 유지되어 재시도가 가능합니다.
   */
  const handleSocialLoginError = (error: Error) => {
    console.error('소셜 로그인 실패:', error);
    
    // 사용자 친화적인 에러 메시지 설정
    const errorMessage = error.message || '소셜 로그인에 실패했습니다. 다시 시도해주세요.';
    setGeneralError(errorMessage);
  };

  return (
    <PageContainer>
      <LoginContainer>
        <LoginTitle>로그인</LoginTitle>

        {/* 일반 로그인 폼 */}
        <LoginForm onSubmit={handleLogin}>
          <FormInput
            label="아이디"
            type="text"
            placeholder="아이디를 입력하세요"
            value={formData.user_id}
            onChange={handleFieldChange('user_id')}
            error={errors.user_id}
            autoComplete="username"
            required
          />

          <FormInput
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleFieldChange('password')}
            error={errors.password}
            autoComplete="current-password"
            required
          />

          {generalError && (
            <ErrorMessage role="alert">
              {generalError}
            </ErrorMessage>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading}
          >
            로그인
          </Button>
        </LoginForm>

        {/* 구분선 */}
        <Divider>
          <DividerLine />
          <DividerText>또는</DividerText>
          <DividerLine />
        </Divider>

        {/* 소셜 로그인 */}
        <SocialLoginSection>
          <GoogleOAuth
            onSuccess={handleSocialLoginSuccess}
            onError={handleSocialLoginError}
          />

          <KakaoOAuth
            onSuccess={handleSocialLoginSuccess}
            onError={handleSocialLoginError}
          />
        </SocialLoginSection>

        {/* 회원가입 링크 */}
        <SignupSection>
          <SignupText>아직 계정이 없으신가요?</SignupText>
          <SignupButton type="button" onClick={openSignupModal}>회원가입</SignupButton>
        </SignupSection>
      </LoginContainer>
    </PageContainer>
  );
};
