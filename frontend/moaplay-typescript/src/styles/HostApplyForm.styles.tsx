import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 10px 16px;
  font-family: 'Pretendard', sans-serif;
  color: #2c2c2e;
`;

export const Heading = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
  color: #111;
`;

export const SuccessMessage = styled.p`
  font-size: 1.1rem;
  color: #28a745;
  text-align: center;
  margin-top: 40px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
`;

export const Input = styled.input`
  padding: 14px 16px;
  font-size: 1rem;
  border: 1px solid #d8d8d8;
  border-radius: 10px;
  background-color: #fafafa;
  transition: border-color 0.3s, background-color 0.3s;

  &:focus {
    border-color: #4c8dff;
    background-color: #fff;
    outline: none;
  }

  &:disabled {
    background-color: #f5f5f5;
  }
`;

export const Textarea = styled.textarea`
  padding: 14px 16px;
  font-size: 1rem;
  border: 1px solid #d8d8d8;
  border-radius: 10px;
  background-color: #fafafa;
  resize: vertical;
  min-height: 140px;
  transition: border-color 0.3s, background-color 0.3s;

  &:focus {
    border-color: #4c8dff;
    background-color: #fff;
    outline: none;
  }

  &:disabled {
    background-color: #f5f5f5;
  }
`;

export const SubmitButton = styled.button`
  padding: 16px 0;
  font-size: 1.05rem;
  font-weight: 600;
  background-color: #4c8dff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #3a74e0;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #a3bffa;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ErrorText = styled.p`
  font-size: 0.875rem;
  color: #d9534f;
  margin-top: 4px;
`;
