import React from 'react';
// 라우팅을 위해 react-router-dom의 Link와 useLocation을 사용합니다.
// 설치되어 있지 않다면 npm install react-router-dom 명령으로 설치해주세요.
import { Link, useLocation } from 'react-router-dom'; 

import logoImage from '../assets/logo.png';  // 로고 이미지 경로 확인!

import { 
    StyledHeader, 
    LogoContainer, 
    Nav, 
    AuthSection
} from '../styles/Header.styles.js'; // 경로 확인!

// 로그인 아이콘을 위해 react-icons 사용 (설치 필요: npm install react-icons)
import { FaSignInAlt } from 'react-icons/fa';

function Header() {
    const location = useLocation(); // 현재 경로를 가져옵니다.
    return (
        <StyledHeader>
            <LogoContainer>
                <Link to="/">
                    <img src={logoImage} alt='MOAPLAY' style={{ height: '30px' }}/> 
                </Link>
            </LogoContainer>
            
            <Nav>
                {/* Link 컴포넌트로 페이지 이동 및 active 클래스 적용 */}
                <Link to="/region" className={location.pathname === '/region' ? 'active' : ''}>지역별</Link>
                <Link to="/recommend" className={location.pathname === '/recommend' ? 'active' : ''}>추천</Link>
                <Link to="/popular" className={location.pathname === '/popular' ? 'active' : ''}>인기</Link>
            </Nav>

            <AuthSection>
                <button style={{ display: 'flex', alignItems: 'center'}}><FaSignInAlt />로그인</button>
            </AuthSection>
        </StyledHeader>
    );
}

export default Header;