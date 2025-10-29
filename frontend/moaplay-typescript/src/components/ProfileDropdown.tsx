import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext' // Auth 컨텍스트
import * as S from '../styles/ProfileDropdown.styles'; // 스타일 임포트
import { FaChevronDown } from 'react-icons/fa';
import defaultProfile from '../assets/default-profile.png';
import { useNavigate } from 'react-router-dom'; // 마이페이지 이동 시 필요

const ProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth(); // 컨텍스트에서 user, logout 가져오기
  // const navigate = useNavigate(); // 마이페이지 이동 시 필요

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  // 드롭다운 외부 클릭 시 닫기
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
  }, [dropdownRef]);

  // user 정보가 없으면 아무것도 렌더링하지 않음 (Header에서 이미 처리하므로 불필요할 수도 있음)
  if (!currentUser) {
    return null;
  }

  const handleMyPageClick = () => {
    navigate('/mypage'); // 마이페이지 경로로 이동
    setIsDropdownOpen(false); // 메뉴 닫기
  };

  const handleLogoutClick = () => {
    logout();
    setIsDropdownOpen(false); // 메뉴 닫기
  };

  return (
    <S.ProfileContainer ref={dropdownRef}>
      <S.ProfileImage
        src={currentUser.profile_image || defaultProfile}
        alt="프로필 사진"
        onClick={toggleDropdown} // 이미지 클릭 시에도 드롭다운 토글
      />
      <S.DropdownArrowButton onClick={toggleDropdown}>
        <FaChevronDown />
      </S.DropdownArrowButton>

      {isDropdownOpen && (
        <S.DropdownMenu>
          <S.MenuItem onClick={handleMyPageClick}>
            마이페이지
          </S.MenuItem>
          <S.MenuItem onClick={handleLogoutClick}>
            로그아웃
          </S.MenuItem>
        </S.DropdownMenu>
      )}
    </S.ProfileContainer>
  );
};

export default ProfileDropdown;