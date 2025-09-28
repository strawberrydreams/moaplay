import React, { useState } from 'react';
import { Wrapper, LogoLink, LogoImg, LogoText } from '../styles/Logo.styles.js';

const Logo: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleProfileClick = (): void => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <Wrapper
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <LogoLink href="/">
        {/* 로고 이미지 */}
        <LogoImg src="logo_light.png" alt="logo" />
        {/* 로고 텍스트 */}
        <LogoText>MOAPLAY</LogoText>
      </LogoLink>

      <div
        role="button"
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={handleProfileClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleProfileClick();
        }}
      >
        <img
          src="profile.png"
          alt="프로필"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>홍길동</span>
          <span style={{ fontSize: '13px', color: '#888' }}>hong@email.com</span>
        </div>
        {menuOpen && (
          <div
            className="menu"
            style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              background: '#fff',
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 10,
              minWidth: '180px',
              padding: '16px 0',
            }}
          >
            <a href="/profile" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#333' }}>
              프로필
            </a>
            <a href="/settings" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#333' }}>
              설정
            </a>
            <a href="/logout" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#333' }}>
              로그아웃
            </a>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default Logo;