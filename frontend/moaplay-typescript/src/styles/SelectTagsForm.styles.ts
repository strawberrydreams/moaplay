import styled from 'styled-components';

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h3`
  margin-top: 8px;
  font-weight: 600;
`;

export const Subtitle = styled.p`
  color: #777;
  font-size: 14px;
  margin-bottom: 10px;
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

export const TagButton = styled.button<{ $selected: boolean }>`
  border: 1px solid ${({ $selected }) => ($selected ? "#007bff" : "#ccc")};
  background-color: ${({ $selected }) => ($selected ? "#007bff" : "transparent")};
  color: ${({ $selected }) => ($selected ? "white" : "#333")};
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $selected }) =>
    $selected ? "#0056b3" : "rgba(0, 123, 255, 0.1)"};
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

export const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const BackButton = styled.button`
  background-color: #ddd;
  color: #333;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
`;

export const LoadingBox = styled.div`
  padding: 40px;
  text-align: center;
  font-weight: 500;
`;

export const ErrorBox = styled.div`
  color: red;
  text-align: center;
  padding: 20px;
`;