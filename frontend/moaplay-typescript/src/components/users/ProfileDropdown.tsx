import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import * as S from '../../styles/components/ProfileDropdown.styles';
import { FaChevronDown } from 'react-icons/fa';
import defaultProfile from '../../assets/default-profile.png';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthContext();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const openDropdown = () => setIsDropdownOpen(true);
    const closeDropdown = () => setIsDropdownOpen(false);
    const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleMyPageClick = () => {
        navigate('/mypage');
        closeDropdown();
    };

    const handleLogoutClick = () => {
        logout();
        closeDropdown();
    };

    const handleCreateEventClick = () => {
        navigate('/events/new');
        closeDropdown();
    };

    const handleAdminPageClick = () => {
        navigate('/admin/dashboard');
        closeDropdown();
    };

    return (
        <S.ProfileContainer
            ref={dropdownRef}
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
        >
            <S.ProfileImage
                src={user.profile_image || defaultProfile}
                alt="프로필 사진"
                onClick={toggleDropdown} // 클릭으로도 여닫기 가능
            />
            <S.DropdownArrowButton onClick={toggleDropdown}>
                <FaChevronDown />
            </S.DropdownArrowButton>

            {isDropdownOpen && (
                <S.DropdownMenu>
                    <S.MenuItem onClick={handleMyPageClick}>마이페이지</S.MenuItem>

                    {user.role === 'host' && (
                        <S.MenuItem onClick={handleCreateEventClick}>행사 작성하기</S.MenuItem>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <S.MenuItem onClick={handleCreateEventClick}>행사 작성하기</S.MenuItem>
                            <S.MenuItem onClick={handleAdminPageClick}>관리자 페이지</S.MenuItem>
                        </>
                    )}

                    <S.MenuItem onClick={handleLogoutClick}>로그아웃</S.MenuItem>
                </S.DropdownMenu>
            )}
        </S.ProfileContainer>
    );
};

export default ProfileDropdown;
