/**
 * 인증 모달 컴포넌트
 * 
 * 로그인/회원가입 폼을 모달로 표시합니다.
 * 포커스 트랩, ESC 키 닫기, 외부 클릭 닫기, 스크롤 락 등의 기능을 포함합니다.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useAuthModal, AuthModalType } from '../../contexts';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';

/**
 * 인증 모달 컴포넌트
 * 
 * URL 기반으로 로그인/회원가입 모달을 표시합니다.
 * 접근성을 위한 포커스 관리와 키보드 네비게이션을 지원합니다.
 */
export const AuthModal: React.FC = () => {
  const { modalType, closeModal, isOpen } = useAuthModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [displayedModalType, setDisplayedModalType] = useState<AuthModalType>(modalType);

  /**
   * modalType이 변경될 때 부드러운 전환 처리
   */
  useEffect(() => {
    if (modalType !== displayedModalType && modalType !== null) {
      // 모달 타입이 변경되면 즉시 새 모달 표시
      setDisplayedModalType(modalType);
    }
  }, [modalType, displayedModalType]);

  /**
   * 모달 닫기 처리 (애니메이션 포함)
   */
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
    }, 200); // 애니메이션 시간과 일치
  }, [closeModal]);

  /**
   * ESC 키로 모달 닫기
   */
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      handleClose();
    }
  }, [isOpen, handleClose]);

  /**
   * 외부 클릭 시 모달 닫기
   */
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  /**
   * 포커스 트랩 구현
   * Tab 키로 모달 내부 요소들만 순환하도록 제한
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!modalRef.current || !isOpen) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: 역방향 이동
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: 정방향 이동
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [isOpen]);

  /**
   * 모달 열릴 때 처리
   * - 현재 포커스된 요소 저장
   * - 배경 스크롤 비활성화
   * - 이벤트 리스너 등록
   * - 모달에 포커스 이동
   */
  useEffect(() => {
    if (isOpen) {
      // 현재 포커스된 요소 저장
      previousActiveElement.current = document.activeElement as HTMLElement;

      // 배경 스크롤 비활성화
      document.body.style.overflow = 'hidden';

      // 이벤트 리스너 등록
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleKeyDown);

      // 모달에 포커스 이동
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 100);

      return () => {
        // 배경 스크롤 복원
        document.body.style.overflow = '';

        // 이벤트 리스너 제거
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('keydown', handleKeyDown);

        // 이전 포커스 복원
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, handleEscapeKey, handleKeyDown]);

  if (!isOpen || !modalType) {
    return null;
  }

  // Portal을 사용하여 body에 직접 렌더링
  return createPortal(
    <ModalOverlay 
      onClick={handleBackdropClick} 
      role="dialog" 
      aria-modal="true"
      $isClosing={isClosing}
    >
      <ModalContainer ref={modalRef} $isClosing={isClosing}>
        <CloseButton
          onClick={handleClose}
          aria-label="모달 닫기"
          type="button"
        >
          ×
        </CloseButton>
        <ModalContent>
          {displayedModalType === 'login' ? <LoginPage /> : <SignupPage />}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>,
    document.body
  );
};

// 스타일 컴포넌트들
const ModalOverlay = styled.div<{ $isClosing?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: ${({ $isClosing }) => $isClosing ? 'fadeOut' : 'fadeIn'} 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const ModalContainer = styled.div<{ $isClosing?: boolean }>`
  position: relative;
  background: transparent;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${({ $isClosing }) => $isClosing ? 'slideDown' : 'slideUp'} 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(20px);
      opacity: 0;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f8f9fa;
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const ModalContent = styled.div`
  /* LoginPage와 SignupPage의 PageContainer가 이미 스타일을 가지고 있으므로
     여기서는 최소한의 스타일만 적용 */
  width: 100%;
`;
