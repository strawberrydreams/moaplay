import styled from 'styled-components';

export const FormContainer = styled.form`
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  padding: 10px;

  @media (max-width: 768px) {
    max-width: 90%;
    padding: 16px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    max-width: 95%;
    padding: 14px;
    border-radius: 8px;
  }
`;

export const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 1.3rem;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1.15rem;
  }

  @media (max-width: 480px) {
    font-size: 1.05rem;
  }
`;

export const Subtitle = styled.p`
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: #666;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 14px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 12px;
  }
`;

export const SearchInput = styled.input`
  width: 95%;
  padding: 10px 12px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #f8f8f8;
  color: #333;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #7a5af8;
    box-shadow: 0 0 5px rgba(122, 90, 248, 0.25);
  }

  @media (max-width: 768px) {
    padding: 9px 10px;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    padding: 8px 9px;
    font-size: 0.8rem;
  }
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    gap: 6px;
    margin-bottom: 18px;
  }

  @media (max-width: 480px) {
    gap: 5px;
    margin-bottom: 16px;
  }
`;

interface TagButtonProps {
  $selected: boolean;
}

export const TagButton = styled.button<TagButtonProps>`
  padding: 6px 12px;
  font-size: 0.85rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? '#7a5af8' : '#f0f0f0')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#333')};
  transition: background 0.2s, color 0.2s, transform 0.1s ease-in-out;

  &:hover {
    background: ${({ $selected }) => ($selected ? '#6650d4' : '#e0e0e0')};
    transform: scale(1.03);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 4px rgba(122, 90, 248, 0.4);
  }

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 0.75rem;
    border-radius: 6px;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    button {
      width: 100%;
    }
  }
`;

export const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 0.95rem;
  background: #7a5af8;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s ease-in-out;

  &:hover {
    background: #6b49e6;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 9px 18px;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 9px;
    font-size: 0.85rem;
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
  transition: background 0.2s;

  &:hover {
    background: #e0e0e0;
  }

  @media (max-width: 768px) {
    padding: 9px 18px;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 9px;
    font-size: 0.85rem;
  }
`;

export const LoadingBox = styled.div`
  width: 100%;
  text-align: center;
  padding: 32px 0;
  color: #888;
  font-size: 0.95rem;

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 24px 0;
  }
`;

export const ErrorBox = styled.div`
  width: 100%;
  text-align: center;
  padding: 32px 0;
  color: #d9534f;
  font-size: 0.95rem;

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 24px 0;
  }
`;
