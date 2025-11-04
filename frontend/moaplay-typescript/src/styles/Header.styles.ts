import styled, { createGlobalStyle } from 'styled-components';

export const StyledHeader = styled.header`
  width: 100%;
  flex-wrap: nowrap; /* ✅ 절대 줄바꿈 안 되게 */
  padding: 0px 40px;
  background-color: #ffffff;
  border-bottom: 1px solid #eeeeee;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: 'Noto Sans KR', sans-serif;
  z-index: 1000;
  position: sticky;
  top: 0;

  @media (max-width: 1024px) {
    padding: 12px 24px;
  }

  @media (max-width: 600px) {
    padding: 10px 16px;
    gap: 8px;
  }

  @media (max-width: 400px) {
    padding: 8px 12px;
  }
`;

export const HeaderInner = styled.div`
  max-width: 1500px; /* 헤더 내부 최대 너비 */
  margin: 0 auto; /* 가운데 정렬 */
  padding: 10px 40px; /* 좌우 여백 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;

  @media (max-width: 1024px) {
    padding: 0px 24px;
  }

  @media (max-width: 600px) {
    padding: 0px 16px;
    gap: 8px;
  }

  @media (max-width: 400px) {
    padding: 0px 12px;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  h1 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333333;
    margin: 0;
  }

  svg {
    margin-right: 8px;
    color: #6a0dad;
  }

  @media (max-width: 768px) {
    img {
      transform: scale(0.7);
    }
  }

  @media (max-width: 480px) {
    img {
      transform: scale(0.7);
    }
  }
`;

export const Nav = styled.nav`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-grow: 1;
  flex-shrink: 1; /* ✅ nav는 공간에 맞게 줄어듦 */
  min-width: 0; /* ✅ flex 아이템이 밀리지 않게 */

  a {
    color: #555;
    text-decoration: none;
    font-weight: 500;
    font-size: 1rem;
    transition: color 0.3s ease;

    &:hover {
      color: #6a0dad;
    }
  }

  @media (max-width: 600px) {
    gap: 16px;
    a {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 400px) {
    gap: 8px;
    a {
      font-size: 0.7rem;
    }
  }
`;

export const AuthSection = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0; /* 로그인 버튼은 줄어들지 않게 */
  gap: 10px;

  div {
    border: none;
    color: #6a0dad;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    white-space: nowrap; /* 버튼 텍스트 줄바꿈 방지 */
  }
  button {
    &:focus {outline:none;}
  }

  svg {
    font-size: 1.2rem;
  }


  @media (max-width: 768px) {
    button, div {
      font-size: 0.85rem;
      padding: 6px 8px;
    }

    svg {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    button, div {
      font-size: 0.7rem;
      padding: 0px;
    }
    img {
      font-size: 0.5rem;
      max-width: 80%;
    }
    svg {
      font-size: 0.8rem;
    }
  }
`;


export const LoginButton = styled.div`
  background: none;
  border: none;
  color: #6a0dad;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 15px;
  gap: 8px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  width: 100px;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 6px 12px;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 5px 10px;
    width: 60px;
  }
`;

/* 전역 스타일 */
export const GlobalStyle = createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;  
  }

  body {
    position: relative;
    font-family: 'Pretendard', sans-serif;
    background-color: #f8f9fa;
  }

  * {
    box-sizing: border-box;
  }

  img, video {
    display: block;
    max-width: 100%; 
    height: auto;
  }

  button {
    &:focus { outline:none; }
  }

`;
