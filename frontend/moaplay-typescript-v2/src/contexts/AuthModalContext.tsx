/**
 * 인증 모달 컨텍스트
 * 
 * 로그인/회원가입 모달의 상태를 전역적으로 관리합니다.
 * URL 기반 모달 제어와 프로그래매틱 모달 제어를 모두 지원합니다.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 인증 모달 타입
 */
export type AuthModalType = 'login' | 'signup' | null;

/**
 * 인증 모달 컨텍스트 타입
 */
interface AuthModalContextType {
  /** 현재 열린 모달 타입 */
  modalType: AuthModalType;
  /** 로그인 모달 열기 */
  openLoginModal: () => void;
  /** 회원가입 모달 열기 */
  openSignupModal: () => void;
  /** 모달 닫기 */
  closeModal: () => void;
  /** 모달이 열려있는지 여부 */
  isOpen: boolean;
}

/**
 * 인증 모달 컨텍스트
 */
const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

/**
 * 인증 모달 프로바이더 Props
 */
interface AuthModalProviderProps {
  children: React.ReactNode;
}

/**
 * 인증 모달 프로바이더
 * 
 * 로그인/회원가입 모달의 상태를 관리합니다.
 * 상태 기반 모달 제어를 사용하여 URL 리다이렉트 루프를 방지합니다.
 */
export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [modalType, setModalType] = useState<AuthModalType>(null);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * URL 경로에 따라 모달 상태 동기화
   * /login과 /signup 경로는 이제 /로 리다이렉트되므로,
   * location.state를 통해 모달을 제어합니다.
   * 
   * 중요: 한 번에 하나의 모달만 열리도록 보장합니다.
   */
  useEffect(() => {
    console.log('[AuthModalContext] Location changed:', location.pathname, location.state);
    
    // location.state에서 모달 타입 확인
    const state = location.state as { showLoginModal?: boolean; showSignupModal?: boolean } | null;
    
    // 우선순위: 로그인 모달 > 회원가입 모달
    // 둘 다 true인 경우 로그인 모달만 표시
    if (state?.showLoginModal) {
      console.log('[AuthModalContext] Opening login modal from state');
      setModalType('login');
      // state 초기화하여 뒤로가기 시 모달이 다시 열리지 않도록 함
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.showSignupModal) {
      console.log('[AuthModalContext] Opening signup modal from state');
      setModalType('signup');
      // state 초기화
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  /**
   * 로그인 모달 열기
   * 상태를 직접 변경하여 모달을 엽니다 (URL 변경 없음).
   * 이미 로그인 모달이 열려있으면 무시합니다.
   */
  const openLoginModal = useCallback(() => {
    console.log('[AuthModalContext] Opening login modal, current modalType:', modalType);
    // 이미 로그인 모달이 열려있으면 무시
    if (modalType === 'login') {
      console.log('[AuthModalContext] Login modal already open, ignoring');
      return;
    }
    
    // 모달 타입을 로그인으로 변경 (다른 모달이 열려있어도 즉시 교체)
    setModalType('login');
  }, [modalType]);

  /**
   * 회원가입 모달 열기
   * 상태를 직접 변경하여 모달을 엽니다 (URL 변경 없음).
   * 이미 회원가입 모달이 열려있으면 무시합니다.
   */
  const openSignupModal = useCallback(() => {
    console.log('[AuthModalContext] Opening signup modal, current modalType:', modalType);
    // 이미 회원가입 모달이 열려있으면 무시
    if (modalType === 'signup') {
      console.log('[AuthModalContext] Signup modal already open, ignoring');
      return;
    }
    
    // 모달 타입을 회원가입으로 변경 (다른 모달이 열려있어도 즉시 교체)
    setModalType('signup');
  }, [modalType]);

  /**
   * 모달 닫기
   * 모달 상태를 null로 설정하여 닫습니다.
   */
  const closeModal = useCallback(() => {
    console.log('[AuthModalContext] Closing modal');
    setModalType(null);
  }, []);

  const contextValue: AuthModalContextType = {
    modalType,
    openLoginModal,
    openSignupModal,
    closeModal,
    isOpen: modalType !== null,
  };

  return (
    <AuthModalContext.Provider value={contextValue}>
      {children}
    </AuthModalContext.Provider>
  );
};

/**
 * 인증 모달 컨텍스트 훅
 * 
 * 인증 모달 상태와 제어 함수를 제공합니다.
 * 
 * @throws {Error} AuthModalProvider 외부에서 사용 시 에러 발생
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthModal = (): AuthModalContextType => {
  const context = useContext(AuthModalContext);
  
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  
  return context;
};
