import styled from 'styled-components';

export const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
`;

export const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 1.3rem;
  color: #333;
`;

export const Subtitle = styled.p`
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: #666;
`;

export const SearchInput = styled.input`
  width: 93%;
  padding: 8px 10px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #f0f0f0;
  color: #333;
  &:focus {
    outline: none;
    border-color: #7a5af8;
  }
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

interface TagButtonProps { $selected: boolean; }
export const TagButton = styled.button<TagButtonProps>`
  padding: 6px 12px;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.$selected ? '#7a5af8' : '#f0f0f0'};
  color: ${props => props.$selected ? '#fff' : '#333'};
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${props => props.$selected ? '#6650d4' : '#e0e0e0'};
  }
  &:focus {
    outline: none;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 0.95rem;
  background: #7a5af8;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;

export const BackButton = styled.button`
  padding: 10px 20px;
  font-size: 0.95rem;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #e0e0e0;
  }
`;

export const LoadingBox = styled.div`
  width: 100%;
  text-align: center;
  padding: 32px 0;
  color: #888;
`;

export const ErrorBox = styled.div`
  width: 100%;
  text-align: center;
  padding: 32px 0;
  color: #d9534f;
`;
