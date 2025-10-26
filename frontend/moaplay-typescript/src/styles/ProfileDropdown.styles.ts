import styled from 'styled-components';

export const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative; /* 드롭다운 메뉴 위치 기준 */
  cursor: pointer;
`;

export const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
  border: 1px solid #eee;
`;

export const DropdownArrowButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #555;
  font-size: 1rem;

  &:hover {
    color: #000;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 120px;
  z-index: 10;
  margin-top: 8px;
`;

export const MenuItem = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 8px 16px;
  text-align: left;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;