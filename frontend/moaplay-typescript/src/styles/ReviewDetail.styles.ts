// src/styles/ReviewDetailModal.styles.ts (새 파일)
import styled from 'styled-components';

// 모달 내용 컨테이너 (Modal 컴포넌트 내부에서 사용될 부분)
// 제공된 CSS 적용하되, position/width/height 등은 Modal 자체에서 관리
export const DetailContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px; // 패딩 조정
  gap: 24px; // 요소 간 간격 조정
  background: #FFFFFF;
  width: 100%; // ModalContent 너비에 맞춤
`;

export const ReviewTitle = styled.h3`
  font-size: 1.5rem; // 제목 크기
  font-weight: 700;
  color: #333;
  margin: 0;
`;

export const ReviewContent = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  margin: 0;
  white-space: pre-wrap; // 줄바꿈 유지
`;

export const ImageGrid = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap; // 이미지 많을 경우 줄바꿈
`;

export const ReviewImage = styled.img`
  width: 100px; // 이미지 크기
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #f0f0f0; // 이미지 없을 때 배경
`;

export const ImagePlaceholder = styled.div`
  width: 100px;
  height: 100px;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  font-size: 2rem;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 16px; // 위 요소와의 간격
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserName = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
`;

export const ReviewDate = styled.span`
  font-size: 0.85rem;
  color: #888;
`;

export const RatingDisplay = styled.div`
  font-size: 1.2rem; // 별 크기
  color: #FFC107; // 별 색상
`;


export const Actions = styled.div`
  position: absolute;
  bottom: 10px; // 위치 조정
  right: 15px; // 위치 조정
  display: flex;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.8); // 배경 약간 추가 (선택 사항)
  padding: 3px 5px; // 배경 패딩 (선택 사항)
  border-radius: 4px; // 배경 둥글게 (선택 사항)
`;

export const ActionButton = styled.button<{ danger?: boolean }>`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 0.8rem;
  color: ${props => props.danger ? '#ff4d4f' : '#888'};
  cursor: pointer;

  &:hover {
    color: ${props => props.danger ? '#d9363e' : '#333'};
    text-decoration: underline;
  }

  outline: none;
`;