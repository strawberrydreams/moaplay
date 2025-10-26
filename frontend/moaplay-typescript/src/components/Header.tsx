import React, {useMemo} from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.png';
import { FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';
import { useSignupFlow } from '../hooks/useSignupFlow.ts';

import { StyledHeader, LogoContainer, Nav, AuthSection, LoginButton } from '../styles/Header.styles';
import ProfileDropdown from './ProfileDropdown.tsx';

interface HeaderProps {
    onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
    const location = useLocation(); // 현재 경로를 가져옵니다.
    const { currentUser } = useAuth();
   
    return (
        <StyledHeader>
            <LogoContainer>
                <Link to="/">
                    {/* 이미지 경로가 로컬 import로 수정되었으므로 그대로 둡니다. */}
                    <img src={logoImage} alt="MOAPLAY" style={{ height: '30px' }} />
                </Link>
            </LogoContainer>

            <Nav>
                {/* Link 컴포넌트로 페이지 이동 및 active 클래스 적용 */}
                <Link
                    to="/region"
                    className={location.pathname === '/region' ? 'active' : ''}
                >
                    지역별
                </Link>
                <Link
                    to="/recommend"
                    className={location.pathname === '/recommend' ? 'active' : ''}
                >
                    추천
                </Link>
                <Link
                    to="/popular"
                    className={location.pathname === '/popular' ? 'active' : ''}
                >
                    인기
                </Link>
            </Nav>

            <AuthSection>
                {currentUser ? (
                    <div>
                        <ProfileDropdown />
                    </div>
                ) : (
                    <LoginButton
                        style={{ display: 'flex', alignItems: 'center' }}
                        onClick={onLoginClick}
                    >
                        <FaSignInAlt />
                        로그인
                    </LoginButton>
                )}
            </AuthSection>
        </StyledHeader>
    );
};

export default Header;