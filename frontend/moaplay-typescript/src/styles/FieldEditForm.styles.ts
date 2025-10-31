// src/styles/FieldEditForm.styles.ts
import styled from 'styled-components';

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
`;

export const Label = styled.label`
  display: block;
  font-size: 15px;
  margin-bottom: 8px;
`;


export const InputGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;

  label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
    box-sizing: border-box;
    background-color: #f8f8f8;
    color: #333;

    &:focus {
      outline: none;
      border-color: #a855f7;
    }
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  box-sizing: border-box;
  background-color: #f8f8f8;
  color: #333;

  &:focus {
    outline: none;
    border-color: #a855f7;
  }
`;


export const ErrorText = styled.p`
  font-size: 13px;
  color: #e74c3c;
  margin-top: 4px;
`;

export const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-bottom: 16px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  button {
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 8px;
    border: none;
  }

  button[type="submit"] {
    background-color: #a855f7;
    color: white;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  button[type="button"] {
    background-color: #f2f2f2;
    color: #333;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;
