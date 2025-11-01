// src/components/ProfileDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import * as S from '../styles/ProfileDropdown.styles';
import { FaChevronDown } from 'react-icons/fa';
import defaultProfile from '../assets/default-profile.png';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  console.log(user?.role);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const handleMyPageClick = () => {
    navigate('/mypage');
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleCreateEventClick = () => {
    navigate('/events/new');
    setIsDropdownOpen(false);
  };

  const handleAdminPageClick = () => {
    navigate('/admin/dashboard');
    setIsDropdownOpen(false);
  };

  return (
    <S.ProfileContainer ref={dropdownRef}>
      <S.ProfileImage
        src={user.profile_image || defaultProfile}
        alt="프로필 사진"
        onClick={toggleDropdown}
      />
      <S.DropdownArrowButton onClick={toggleDropdown}>
        <FaChevronDown />
      </S.DropdownArrowButton>

      {isDropdownOpen && (
        <S.DropdownMenu>
          <S.MenuItem onClick={handleMyPageClick}>마이페이지</S.MenuItem>

          {/* HOST 역할이면 행사 작성하기 메뉴 추가 */}
          {user.role === 'host' && (
            <S.MenuItem onClick={handleCreateEventClick}>
              행사 작성하기
            </S.MenuItem>
          )}

          {/* ADMIN 역할이면 행사 작성 + 관리자 페이지 메뉴 추가 */}
          {user.role === 'admin' && (
            <>
              <S.MenuItem onClick={handleCreateEventClick}>
                행사 작성하기
              </S.MenuItem>
              <S.MenuItem onClick={handleAdminPageClick}>
                관리자 페이지
              </S.MenuItem>
            </>
          )}

          <S.MenuItem onClick={handleLogoutClick}>로그아웃</S.MenuItem>
        </S.DropdownMenu>
      )}
    </S.ProfileContainer>
  );
};

export default ProfileDropdown;
