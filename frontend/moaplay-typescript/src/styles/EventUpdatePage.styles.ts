import styled from "styled-components";

export const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f6f8;

  @media (max-width: 768px) {
    background: #fafbfc;
  }
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
    border-radius: 14px;
  }

  @media (max-width: 768px) {
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

export const FormHeader = styled.div`
  padding: 48px 40px 24px;

  @media (max-width: 1024px) {
    padding: 40px 32px 20px;
  }

  @media (max-width: 768px) {
    padding: 32px 20px 16px;
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

  @media (max-width: 1024px) {
    font-size: 28px;
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
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
    padding: 12px;
    font-size: 13.5px;
  }

  @media (max-width: 480px) {
    margin: 12px 16px;
    font-size: 13px;
  }
`;

export const Form = styled.form`
  padding: 24px 40px 40px;

  @media (max-width: 1024px) {
    padding: 24px 32px 32px;
  }

  @media (max-width: 768px) {
    padding: 20px 20px 28px;
  }

  @media (max-width: 480px) {
    padding: 16px 16px 24px;
  }
`;

export const FormSection = styled.div`
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
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

  @media (max-width: 768px) {
    font-size: 13.5px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const ExistingImagesContainer = styled.div`
  margin-bottom: 20px;
`;

export const ExistingImagesLabel = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

export const ExistingImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
`;

export const ExistingImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e9ecef;

  @media (max-width: 480px) {
    border-radius: 6px;
  }
`;

export const ExistingImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(220, 53, 69, 1);
  }

  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }
`;

export const InputGroup = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const RequiredMark = styled.span`
  color: #dc3545;
`;

export const TextInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== "hasError",
})<{ hasError?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${(p) => (p.hasError ? "#dc3545" : "#e2e4e8")};
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: #fafbfc;

  &:focus {
    outline: none;
    border-color: ${(p) => (p.hasError ? "#dc3545" : "#4c8dff")};
    background-color: #ffffff;
  }

  &::placeholder {
    color: #a9abb4;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    padding: 12px 14px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px 12px;
    border-radius: 10px;
  }
`;

export const TextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== "hasError",
})<{ hasError?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${(p) => (p.hasError ? "#dc3545" : "#e2e4e8")};
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 140px;
  background-color: #fafbfc;
  transition: border-color 0.3s ease, background-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(p) => (p.hasError ? "#dc3545" : "#4c8dff")};
    background-color: #ffffff;
  }

  &::placeholder {
    color: #a9abb4;
  }

  @media (max-width: 768px) {
    font-size: 15px;
    min-height: 120px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px 12px;
    min-height: 100px;
    border-radius: 10px;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #dc3545;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

export const CharacterCount = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #6b6f85;
  text-align: right;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  margin-top: 56px;
  padding-top: 20px;

  @media (max-width: 768px) {
    gap: 16px;
    margin-top: 40px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    margin-top: 32px;
    gap: 12px;
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
    padding: 12px 24px;
    font-size: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 10px;
    justify-content: center;
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
  box-shadow: 0 4px 12px rgba(122, 90, 248, 0.25);
  transition: all 0.25s ease;

  &:hover:not(:disabled) {
    background: #6941f2;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(122, 90, 248, 0.35);
  }

  &:active:not(:disabled) {
    background: #5b35e0;
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(122, 90, 248, 0.25);
  }
`;

export const DeleteButton = styled(Button)`
  background: #dc3545;
  color: white;

  &:hover:not(:disabled) {
    background: #c82333;
    transform: translateY(-2px);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;
