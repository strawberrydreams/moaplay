import styled from 'styled-components';

// 푸터 전체 컨테이너
export const StyledFooter = styled.footer`
    background-color: #ffffff; /* 흰색 배경 */
    color: #555555; /* 회색 텍스트 */
    padding: 30px 40px;
    border-top: 1px solid #eeeeee; /* 헤더와 동일한 얇은 구분선 */
    font-size: 0.85rem;
    font-family: 'Noto Sans KR', sans-serif;
    width: 100%;
    box-sizing: border-box; /* 패딩이 너비에 포함되도록 */
`;

// 푸터 내용 (섹션들을 가로로 배열)
export const FooterContent = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 40px;
    max-width: 1200px; /* 최대 너비 설정 */
    margin: 0 auto;
    padding-bottom: 20px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 20px;
    }
`;

// 각 항목 섹션
export const FooterSection = styled.div`
    flex: 1; /* 각 섹션이 공간을 균등하게 차지 */
    min-width: 150px;
`;

// 섹션 제목
export const FooterTitle = styled.h4`
    font-size: 1rem;
    font-weight: 600;
    color: #333333;
    margin-bottom: 10px;
`;

// 링크 목록
export const FooterList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
        margin-bottom: 8px;
    }

    a {
        color: #777777;
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
            color: #6a0dad; /* 보라색 계열 */
        }
    }
`;

// 저작권 및 회사 정보
export const FooterBottom = styled.div`
    text-align: center;
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid #f0f0f0;
    
    p {
        margin: 5px 0;
        color: #999999;
    }
`;