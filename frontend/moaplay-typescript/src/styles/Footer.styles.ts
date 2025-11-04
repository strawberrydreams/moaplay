import styled from 'styled-components';

// --- 전체 푸터 컨테이너 ---
export const StyledFooter = styled.footer`
  background-color: #ffffff;
  color: #555555;
  padding: 40px 40px 30px;
  border-top: 1px solid #eeeeee;
  font-size: 0.85rem;
  font-family: 'Noto Sans KR', sans-serif;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 30px 30px 25px;
  }

  @media (max-width: 768px) {
    padding: 25px 20px 20px;
  }

  @media (max-width: 480px) {
    padding: 20px 16px 15px;
    font-size: 0.8rem;
  }
`;

// --- 섹션들을 담는 래퍼 ---
export const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap; /* 자동 줄바꿈 */
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 20px;

  @media (max-width: 1024px) {
    gap: 30px;
  }

  @media (max-width: 768px) {
    gap: 20px;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

// --- 각 항목 섹션 ---
export const FooterSection = styled.div`
  flex: 1;
  min-width: 180px;

  @media (max-width: 1024px) {
    min-width: 160px;
  }

  @media (max-width: 768px) {
    min-width: 140px;
  }

  @media (max-width: 600px) {
    width: 100%; /* 모바일에서는 전체 너비 사용 */
  }
`;

// --- 섹션 제목 ---
export const FooterTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

// --- 링크 목록 ---
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
      color: #6a0dad;
    }
  }

  @media (max-width: 480px) {
    li {
      margin-bottom: 6px;
    }
  }
`;

// --- 하단 회사 정보 / 저작권 ---
export const FooterBottom = styled.div`
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #f0f0f0;

  p {
    margin: 5px 0;
    color: #999999;
  }

  @media (max-width: 768px) {
    p {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    p {
      font-size: 0.75rem;
      line-height: 1.4;
    }
  }
`;
