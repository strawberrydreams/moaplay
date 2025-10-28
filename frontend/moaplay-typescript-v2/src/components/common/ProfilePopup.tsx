/**
 * 프로필 팝업 컴포넌트
 * 
 * 리뷰에서 프로필 사진 클릭 시 표시되는 팝업입니다.
 * 사용자의 기본 정보와 프로필 보기 버튼을 제공합니다.
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserSummary } from '../../types';
import { VerifiedBadge } from './VerifiedBadge';

/**
 * ProfilePopup 컴포넌트 Props
 */
interface ProfilePopupProps {
  /** 표시할 사용자 정보 */
  user: UserSummary;
  /** 팝업 닫기 핸들러 */
  onClose: () => void;
  /** 팝업 위치 (클릭한 요소의 위치) */
  position?: {
    x: number;
    y: number;
  };
  /** 클래스명 */
  className?: string;
}

/**
 * 프로필 팝업 컴포넌트
 * 
 * 사용자의 프로필 사진, 닉네임, 인증 마크를 표시하고
 * 프로필 보기 버튼을 통해 사용자 프로필 페이지로 이동할 수 있습니다.
 */
export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  user,
  onClose,
  position,
  className
}) => {
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);

  /**
   * 팝업 외부 클릭 시 닫기 처리
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  /**
   * 프로필 보기 버튼 클릭 처리
   */
  const handleViewProfile = () => {
    navigate(`/users/${user.id}/profile`);
    onClose();
  };

  /**
   * 팝업 위치 계산
   */
  const getPopupStyle = () => {
    if (!position) {
      return {};
    }

    const { x, y } = position;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 280; // 예상 팝업 너비
    const popupHeight = 200; // 예상 팝업 높이

    let left = x;
    let top = y + 10; // 클릭 위치에서 약간 아래

    // 화면 오른쪽 경계를 벗어나는 경우
    if (left + popupWidth > viewportWidth) {
      left = x - popupWidth;
    }

    // 화면 하단 경계를 벗어나는 경우
    if (top + popupHeight > viewportHeight) {
      top = y - popupHeight - 10; // 클릭 위치 위로
    }

    // 화면 왼쪽 경계를 벗어나는 경우
    if (left < 0) {
      left = 10;
    }

    // 화면 상단 경계를 벗어나는 경우
    if (top < 0) {
      top = 10;
    }

    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 1050, // 다른 요소들보다 위에 표시
    };
  };

  return (
    <PopupOverlay>
      <PopupContainer
        ref={popupRef}
        className={className}
        style={getPopupStyle()}
      >
        {/* 닫기 버튼 */}
        <CloseButton onClick={onClose} aria-label="팝업 닫기">
          ×
        </CloseButton>

        {/* 사용자 정보 */}
        <UserInfo>
          <ProfileImage
            src={user.profile_image || '/default-avatar.png'}
            alt={`${user.nickname}의 프로필`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          
          <UserDetails>
            <UserName>
              {user.nickname}
              {user.role === 'host' && (
                <VerifiedBadge />
              )}
            </UserName>
            
            <UserRole>
              {user.role === 'host' && '인증된 주최자'}
              {user.role === 'admin' && '관리자'}
              {user.role === 'user' && '일반 사용자'}
            </UserRole>
          </UserDetails>
        </UserInfo>

        {/* 액션 버튼 */}
        <ActionSection>
          <ViewProfileButton onClick={handleViewProfile}>
            프로필 보기
          </ViewProfileButton>
        </ActionSection>
      </PopupContainer>
    </PopupOverlay>
  );
};

// 스타일 컴포넌트들
const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: ${({ theme }) => theme.zIndex.popover};
  pointer-events: none;
`;

const PopupContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 280px;
  max-width: 320px;
  pointer-events: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  /* 애니메이션 */
  animation: popupFadeIn 0.2s ease-out;
  
  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fonts.size.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProfileImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const UserRole = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: center;
`;

const ViewProfileButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;