import styled from 'styled-components';

export const Card = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 23.1837px;
  gap: 10px;
  /* width/height/min-width는 부모 그리드가 제어하도록 제거하거나 유연하게 설정 */
  /* width: 376px; */
  /* min-width: 231.84px; */
  /* height: 206px; */
  background: #FFFFFF;
  border: 0.965986px solid #D9D9D9;
  border-radius: 7.79734px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  position: relative; // 액션 버튼 위치 기준
  overflow: hidden; // 내용 넘침 방지

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const Title = styled.h4`
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export const Content = styled.p`
  font-size: 0.9rem;
  color: #555;
  margin: 0;
  line-height: 1.4;
  flex-grow: 1; // 사용 가능한 공간 채우기 (옵션)
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; // 최대 2줄
  -webkit-box-orient: vertical;
  width: 100%;
  min-height: calc(1.4em * 2); // 2줄 높이 확보
`;

export const ImageGrid = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto; // 하단으로 밀기
`;

export const Thumbnail = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f0f0f0;
`;

export const ImagePlaceholder = styled.div`
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  font-size: 1.5rem;
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 10px;
`;

export const UserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UserProfileImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee;
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const UserName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
`;

export const Date = styled.span`
  font-size: 0.75rem;
  color: #888;
`;

export const Rating = styled.div`
  font-size: 1rem;
  color: #FFC107;
  white-space: nowrap;
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