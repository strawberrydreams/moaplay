import styled from "styled-components";
import { BiMenu } from "react-icons/bi"; // Bootstrap 아이콘 대체

// Wrapper 전체 컨테이너 (flex 정렬)
export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// 로고 영역
export const LogoLink = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none; /* 기본 링크 밑줄 제거 */
`;

// 로고 이미지
export const LogoImg = styled.img`
  width: 40px;   /* 필요에 맞게 조절 */
  height: auto;
  margin-right: 8px;
`;

// 로고 텍스트
export const LogoText = styled.span`
  display: none;

  @media (min-width: 992px) {
    display: block; /* lg 이상에서만 보이도록 */
  }
  font-weight: 600;
  font-size: 20px;
  color: #000; /* 시안에 맞춰 색상 변경 */
`;

// 햄버거 버튼 아이콘
export const ToggleButton = styled(BiMenu)`
  font-size: 28px;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #000; /* 호버 시 색상 */
  }
`;