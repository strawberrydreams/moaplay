/**
 * 헤더 컴포넌트
 * 
 * 애플리케이션의 상단 네비게이션 바를 제공합니다.
 * 로고, 메뉴, 사용자 인증 상태에 따른 UI를 포함합니다.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useAuthModal } from '../../contexts';
import logoImage from '../../assets/logo.png';
import {
  HeaderContainer,
  HeaderContent,
  LogoSection,
  LogoLink,
  Logo,
  NavigationSection,
  NavLink,
  UserSection,
  AuthenticatedMenu,
  CreateEventButton,
  ProfileMenuContainer,
  ProfileButton,
  ProfileImage,
  ProfileName,
  ProfileDropdown,
  DropdownItem,
  DropdownDivider,
  GuestMenu,
  LoginButton,
  SignupButton,
  SkipLink,
} from '../../styles/components';

/**
 * 헤더 컴포넌트 Props 타입
 */
interface HeaderProps {
  className?: string;
}

/**
 * 헤더 컴포넌트
 * 
 * 로그인 상태에 따라 다른 UI를 표시하며, 네비게이션 메뉴와
 * 사용자 프로필 메뉴를 제공합니다.
 */
export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { openLoginModal, openSignupModal } = useAuthModal();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  /**
   * 프로필 메뉴 토글
   */
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  /**
   * 외부 클릭 시 드롭다운 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* 접근성을 위한 스킵 링크 */}
      <SkipLink href="#main-content">메인 콘텐츠로 건너뛰기</SkipLink>

      <HeaderContainer ref={headerRef} className={className}>
        <HeaderContent>
          {/* 왼쪽: 로고 */}
          <LogoSection>
            <LogoLink 
              to="/" 
              aria-label="Moaplay 홈페이지"
            >
              <Logo src={logoImage} alt="Moaplay" />
            </LogoLink>
          </LogoSection>

          {/* 가운데: 네비게이션 메뉴 */}
          <NavigationSection role="navigation" aria-label="주요 메뉴">
            <NavLink to="/region">지역별</NavLink>
            <NavLink to="/recommend">추천</NavLink>
            <NavLink to="/popular">인기</NavLink>
          </NavigationSection>

          {/* 오른쪽: 사용자 섹션 */}
          <UserSection>
            {isAuthenticated ? (
              <AuthenticatedMenu>
                {/* 행사 작성 버튼 (Organizer 이상만 표시) */}
                {(user?.role === 'host') && (
                  <CreateEventButton
                    onClick={() => navigate('/events/new')}
                    aria-label="새 행사 작성"
                  >
                    + 새 행사
                  </CreateEventButton>
                )}

                {/* 프로필 메뉴 */}
                <ProfileMenuContainer>
                  <ProfileButton
                    onClick={toggleProfileMenu}
                    aria-expanded={showProfileMenu}
                    aria-haspopup="menu"
                    aria-label={`${user?.nickname} 프로필 메뉴`}
                  >
                    <ProfileImage
                      src={user?.profileImage || '/default-avatar.png'}
                      alt={`${user?.nickname || '사용자'} 프로필 사진`}
                    />
                    <ProfileName>{user?.nickname}</ProfileName>
                  </ProfileButton>

                  {showProfileMenu && (
                    <ProfileDropdown role="menu" aria-label="프로필 메뉴">
                      <DropdownItem 
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileMenu(false);
                        }} 
                        role="menuitem"
                      >
                        마이페이지
                      </DropdownItem>
                      <DropdownItem 
                        onClick={() => {
                          navigate('/activities/favorites');
                          setShowProfileMenu(false);
                        }} 
                        role="menuitem"
                      >
                        찜한 행사
                      </DropdownItem>
                      <DropdownItem 
                        onClick={() => {
                          navigate('/activities/reviews');
                          setShowProfileMenu(false);
                        }} 
                        role="menuitem"
                      >
                        내 리뷰
                      </DropdownItem>
                      {user?.role === 'host' && (
                        <DropdownItem 
                          onClick={() => {
                            navigate('/events/new');
                            setShowProfileMenu(false);
                          }} 
                          role="menuitem"
                        >
                          행사 등록
                        </DropdownItem>
                      )}
                      {user?.role === 'admin' && (
                        <DropdownItem 
                          onClick={() => {
                            navigate('/admin/dashboard');
                            setShowProfileMenu(false);
                          }} 
                          role="menuitem"
                        >
                          관리자 대시보드
                        </DropdownItem>
                      )}
                      <DropdownDivider />
                      <DropdownItem
                        onClick={handleLogout}
                        className="danger"
                        role="menuitem"
                      >
                        로그아웃
                      </DropdownItem>
                    </ProfileDropdown>
                  )}
                </ProfileMenuContainer>
              </AuthenticatedMenu>
            ) : (
              <GuestMenu>
                <LoginButton onClick={openLoginModal}>로그인</LoginButton>
                <SignupButton onClick={openSignupModal}>회원가입</SignupButton>
              </GuestMenu>
            )}
          </UserSection>
        </HeaderContent>
      </HeaderContainer>
    </>
  );
};

