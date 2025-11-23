import styled from "styled-components";

export const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f6f8;
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 48px 24px;

  @media (max-width: 1024px) {
    padding: 40px 20px;
  }

  @media (max-width: 768px) {
    padding: 32px 16px;
  }

  @media (max-width: 480px) {
    padding: 24px 12px;
  }
`;

export const FormContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 1024px) {
    max-width: 900px;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 12px;
  }
`;

export const FormHeader = styled.div`
  padding: 48px 40px 24px;

  @media (max-width: 768px) {
    padding: 32px 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 24px 16px 12px;
  }
`;

export const FormTitle = styled.h1`
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 700;
  color: #19202c;

  @media (max-width: 768px) {
    font-size: 26px;
  }

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

export const FormSubtitle = styled.p`
  margin: 0;
  font-size: 18px;
  color: #6b6f85;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const ErrorAlert = styled.div`
  margin: 20px 40px;
  padding: 16px;
  background: #ffefee;
  color: #b00020;
  border-radius: 12px;
  font-size: 14px;

  @media (max-width: 768px) {
    margin: 16px 24px;
  }

  @media (max-width: 480px) {
    margin: 12px 16px;
    font-size: 13px;
  }
`;

export const Form = styled.form`
  padding: 24px 40px 40px;

  @media (max-width: 768px) {
    padding: 20px 24px 32px;
  }

  @media (max-width: 480px) {
    padding: 16px 16px 24px;
  }
`;

export const FormSection = styled.div`
  margin-bottom: 48px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 36px;
  }

  @media (max-width: 480px) {
    margin-bottom: 28px;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #19202c;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const SectionDescription = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  color: #6b6f85;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const InputGroup = styled.div`
  margin-bottom: 22px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #3e4150;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const RequiredMark = styled.span`
  color: #d32f2f;
  margin-left: 4px;
`;

export const TextInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== "hasError",
})<{ hasError?: boolean }>`
  width: 96%;
  padding: 14px 16px;
  border: 2px solid ${(props) => (props.hasError ? "#d32f2f" : "#e2e4e8")};
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: #fafbfc;
  color: #3e4150;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#d32f2f" : "#7a5af8")};
    background-color: #ffffff;
  }

  &::placeholder {
    color: #a9abb4;
  }

  @media (max-width: 768px) {
    width: 92%;
    font-size: 15px;
    padding: 12px 14px;
  }

  @media (max-width: 480px) {
    width: 90%;
    font-size: 14px;
    padding: 10px 12px;
  }
`;

export const TextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== "hasError",
})<{ hasError?: boolean }>`
  width: 96%;
  padding: 14px 16px;
  border: 2px solid ${(props) => (props.hasError ? "#d32f2f" : "#e2e4e8")};
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  min-height: 100px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: #fafbfc;
  color: #3e4150;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#d32f2f" : "#7a5af8")};
    background-color: #ffffff;
  }

  &::placeholder {
    color: #a9abb4;
  }

  @media (max-width: 768px) {
    width: 92%;
    font-size: 15px;
    padding: 12px 14px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px 12px;
    width: 90%;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #d32f2f;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const CharacterCount = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #6b6f85;
  text-align: right;
  width: 98%;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  margin-top: 56px;
  padding-top: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-top: 40px;
    gap: 16px;
  }

  @media (max-width: 480px) {
    margin-top: 32px;
    gap: 12px;
    justify-content: center; /* 모바일 중앙 정렬 */
  }
`;

export const Button = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    padding: 12px 22px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px 18px;
  }
`;

export const CancelButton = styled(Button)`
  background: #f3f4f6;
  color: #3e4150;

  &:hover:not(:disabled) {
    background: #e5e6e9;
  }
`;

export const SubmitButton = styled(Button)`
  background: #7a5af8;
  color: white;

  &:hover:not(:disabled) {
    background: #6650d4;
    transform: translateY(-2px);
  }
`;
