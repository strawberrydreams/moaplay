import styled from 'styled-components';

export const InputWrapper = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 6px;
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  padding: 10px;
  border: 1px solid ${({ $hasError }) => ($hasError ? 'red' : '#ccc')};
  border-radius: 4px;
  width: 100%;
  font-size: 14px;

  &:focus {
    outline: none;
  }
`;

export const ErrorMessage = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 4px;
`;