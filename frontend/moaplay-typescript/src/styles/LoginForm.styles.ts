import styled from 'styled-components';

// --- 전체 Form ---
export const FormContainer = styled.form.attrs({ noValidate: true })`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    gap: 12px;
    max-width: 350px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    max-width: 95%;
  }
`;

// --- 입력 필드 그룹 ---
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  label {
    font-size: 0.9rem;
    margin-bottom: 5px;
    color: #555;

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }

  input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    background-color: white;
    color: #333;
    transition: all 0.2s ease;
    -webkit-text-fill-color: #333 !important;

    &:focus {
      border-color: #8a2be2;
      outline: none;
      box-shadow: 0 0 4px rgba(138, 43, 226, 0.3);
    }

    @media (max-width: 768px) {
      padding: 9px;
      font-size: 0.95rem;
    }

    @media (max-width: 480px) {
      padding: 8px;
      font-size: 0.9rem;
    }
  }
`;

// --- 제출 버튼 ---
export const SubmitButton = styled.button`
  background-color: #6a0dad;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #510a8d;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 9px;
    font-size: 0.9rem;
  }
`;

// --- 링크 그룹 ---
export const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-top: 5px;

  span,
  a {
    color: #6a0dad;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
`;

// --- 오류 메시지 ---
export const ErrorMessage = styled.p`
  color: #e53935;
  font-size: 0.8rem;
  margin-top: 5px;
  margin-bottom: 0;
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;
