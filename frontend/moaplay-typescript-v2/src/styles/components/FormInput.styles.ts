/**
 * FormInput 컴포넌트 스타일
 * 
 * 폼 입력 필드의 모든 스타일을 정의합니다.
 * 접근성, 유효성 검사, 반응형 디자인을 고려한 스타일링을 포함합니다.
 */

import styled, { css } from 'styled-components';

/**
 * 폼 그룹 컨테이너
 */
export const FormGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 라벨 스타일
 */
export const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $required?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  ${({ $required }) => $required && css`
    &::after {
      content: ' *';
      color: ${({ theme }) => theme.colors.danger};
    }
  `};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 입력 필드 기본 스타일
 */
const inputBaseStyles = css`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  background-color: ${({ theme }) => theme.colors.background};
  transition: all ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundDisabled};
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.borderLight};
  }

  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    border-width: 3px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.sm};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 에러 상태 스타일
 */
const errorStyles = css`
  border-color: ${({ theme }) => theme.colors.danger};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.danger};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.dangerLight};
  }
`;

/**
 * 성공 상태 스타일
 */
const successStyles = css`
  border-color: ${({ theme }) => theme.colors.success};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.success};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.successLight || theme.colors.primaryLight};
  }
`;

/**
 * 텍스트 입력 필드
 */
export const TextInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $hasError?: boolean; $hasSuccess?: boolean }>`
  ${inputBaseStyles}
  
  ${({ $hasError }) => $hasError && errorStyles}
  ${({ $hasSuccess }) => $hasSuccess && successStyles}
`;

/**
 * 텍스트 영역
 */
export const TextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $hasError?: boolean; $hasSuccess?: boolean; $rows?: number }>`
  ${inputBaseStyles};
  resize: vertical;
  min-height: ${({ $rows = 3 }) => $rows * 1.5}rem;
  
  ${({ $hasError }) => $hasError && errorStyles}
  ${({ $hasSuccess }) => $hasSuccess && successStyles}
`;

/**
 * 선택 박스
 */
export const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $hasError?: boolean; $hasSuccess?: boolean }>`
  ${inputBaseStyles};
  cursor: pointer;
  
  ${({ $hasError }) => $hasError && errorStyles}
  ${({ $hasSuccess }) => $hasSuccess && successStyles}
`;

/**
 * 체크박스 컨테이너
 */
export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

/**
 * 체크박스 입력
 */
export const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 16px;
    height: 16px;
  }
`;

/**
 * 체크박스 라벨
 */
export const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  user-select: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 라디오 버튼 그룹
 */
export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  &.horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    &.horizontal {
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.sm};
    }
  }
`;

/**
 * 라디오 버튼 컨테이너
 */
export const RadioContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

/**
 * 라디오 버튼 입력
 */
export const RadioInput = styled.input.attrs({ type: 'radio' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 16px;
    height: 16px;
  }
`;

/**
 * 라디오 버튼 라벨
 */
export const RadioLabel = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  user-select: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 에러 메시지
 */
export const ErrorMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &::before {
    content: '⚠️';
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 10px;
  }
`;

/**
 * 성공 메시지
 */
export const SuccessMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &::before {
    content: '✅';
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 10px;
  }
`;

/**
 * 도움말 텍스트
 */
export const HelpText = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  line-height: ${({ theme }) => theme.fonts.lineHeight.normal};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 10px;
  }
`;

/**
 * 입력 그룹 (버튼과 함께 사용)
 */
export const InputGroup = styled.div`
  display: flex;
  align-items: stretch;

  ${TextInput} {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }
`;

/**
 * 파일 입력 래퍼
 */
export const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
  overflow: hidden;

  input[type="file"] {
    position: absolute;
    left: -9999px;
    opacity: 0;
  }
`;

/**
 * 파일 입력 버튼
 */
export const FileInputButton = styled.div`
  ${inputBaseStyles};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-style: dashed;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::before {
    content: '📁';
    font-size: ${({ theme }) => theme.fonts.size.lg};
  }
`;