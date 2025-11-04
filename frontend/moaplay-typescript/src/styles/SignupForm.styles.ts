import styled, { keyframes } from 'styled-components';

//  포커스 시 부드럽게 번지는 효과
const focusGlow = keyframes`
  0% {
    box-shadow: 0 0 0 rgba(138, 43, 226, 0);
  }
  100% {
    box-shadow: 0 0 8px rgba(138, 43, 226, 0.3);
  }
`;

// --- Form 전체 ---
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
    border: 1.5px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    background-color: white;
    color: #333;
    transition: border 0.25s ease, box-shadow 0.25s ease;
    -webkit-text-fill-color: #333 !important;

    &:focus {
      border-color: #8a2be2;
      animation: ${focusGlow} 0.25s forwards;
      outline: none;
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

// --- 버튼 ---
export const SubmitButton = styled.button`
  background-color: #8a2be2;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: #7323c8;
    box-shadow: 0 4px 10px rgba(138, 43, 226, 0.25);
    transform: translateY(-1px);
  }

  &:active {
    background-color: #621ea9;
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(138, 43, 226, 0.2);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
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

// --- 하단 링크 ---
export const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-top: 5px;

  span,
  a {
    color: #8a2be2;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
      color: #7323c8;
    }
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
`;

// --- 에러 메시지 ---
export const ErrorMessage = styled.p`
  color: #e53935;
  font-size: 0.8rem;
  margin-top: 5px;
  margin-bottom: 0;

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

export const SuccessMessage = styled.p`
  margin: 8px 0 0;
  font-size: 0.9rem;
  color: #2e7d32; /* 초록색 느낌 */
  text-align: center;
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    button {
      width: 100%;
    }
  }
`;