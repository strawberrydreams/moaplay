import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.png';
import { FaSignInAlt } from 'react-icons/fa';
import {
  StyledHeader,
  LogoContainer,
  Nav,
  AuthSection,
} from '../styles/Header.styles.ts';

const Header: React.FC = () => {
  const location = useLocation(); // 현재 경로를 가져옵니다.

  return (
    <StyledHeader>
      <LogoContainer>
        <Link to="/">
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
        <button
          type="button"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <FaSignInAlt />
          로그인
        </button>
      </AuthSection>
    </StyledHeader>
  );
};

export default Header;