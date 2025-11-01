import styled, { createGlobalStyle } from 'styled-components'; // 👈 1. 'createGlobalStyle'을 반드시 임포트해야 합니다.


export const StyledHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 40px;
    background-color: #ffffff;
    border-bottom: 1px solid #eeeeee;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    font-family: 'Noto Sans KR', sans-serif;
    z-index: 1000;
`;

export const LogoContainer = styled.div`
    display: flex;
    align-items: center;

    h1 {
        font-size: 1.4rem;
        font-weight: 700;
        color: #333333;
        margin: 0;
        cursor: pointer;
    }
    /* Moaplay 텍스트 옆에 아이콘이 있다면 추가 */
    svg {
        margin-right: 8px;
        color: #6a0dad; /* 보라색 계열 */
    }
`;

export const Nav = styled.nav`
    display: flex;
    gap: 30px; /* 내비게이션 항목 간 간격 */

    a {
        color: #555555; /* 회색 텍스트 */
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        padding: 5px 0;
        position: relative; /* 하단 밑줄 애니메이션을 위해 */
        transition: color 0.3s ease;

        &:hover {
            color: #6a0dad; /* 보라색 계열 */
        }

        /* 활성 페이지에 밑줄 표시 */
        &.active::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: #6a0dad;
        }
    }
`;

export const AuthSection = styled.div`
    display: flex;
    align-items: center;
    gap: 15px; /* 아이콘과 텍스트 간 간격 */

    button {
        background: none;
        border: none;
        color: #131313; /* 보라색 계열 */
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        padding: 8px 15px;
        gap: 8px;
        border-radius: 5px;
        transition: background-color 0.3s ease;
        outline: none;

    }

    svg {
        color: #6a0dad; /* 로그인 아이콘 색상 */
        font-size: 1.2rem;
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
    outline: none;
`

// 전역 스타일 (옵션: 기본 폰트 설정 등을 위해)
export const GlobalStyle = createGlobalStyle`
    /* 모든 브라우저의 기본 여백을 초기화 */
    html, body, #root {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
    }

//     html:not(.calendar-wrapper){
//     zoom: 0.7;

//     /* Firefox 대응 */
//     @-moz-document url-prefix() {
//       zoom: initial;
//     }
//   }
    

  body {
    font-family: 'Pretendard', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
  }
`;