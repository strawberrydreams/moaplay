import styled from 'styled-components';

export const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  font-size: 18px;
  margin-bottom: 24px;
  color: #333;
`;

export const Label = styled.label`
  display: block;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
`;

export const Input = styled.input`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 15px;
  margin-bottom: 24px;
  box-sizing: border-box;
  background-color: #f8f8f8;
  color: #333;


  &:focus {
    outline: none;
    border-color: #a855f7;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #a855f7;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 16px;

  &:hover {
    background-color: #9333ea;
  }
`;

export const CancelButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #f8f8f8;
  color: #5a5a5aff;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 16px;
  text-align: center;

  &:hover {
    background-color: #e9e9e9;
  }
`;