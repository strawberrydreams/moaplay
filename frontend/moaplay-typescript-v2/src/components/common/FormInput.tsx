/**
 * 공통 폼 입력 컴포넌트
 * 
 * 로그인, 회원가입 등에서 사용할 수 있는 재사용 가능한 입력 필드 컴포넌트입니다.
 * 유효성 검사, 에러 표시, 라벨 등의 기능을 포함합니다.
 */

import React, { forwardRef } from 'react';
import styled from 'styled-components';

/**
 * 폼 입력 컴포넌트 Props
 */
interface FormInputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}

/**
 * 공통 폼 입력 컴포넌트
 * 
 * 라벨, 입력 필드, 에러 메시지를 포함한 완전한 폼 입력 컴포넌트입니다.
 * 유효성 검사 결과에 따른 시각적 피드백을 제공합니다.
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  maxLength,
  autoComplete,
  className
}, ref) => {
  /**
   * 입력값 변경 처리
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <InputContainer className={className}>
      {label && (
        <Label htmlFor={`input-${label}`} required={required}>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </Label>
      )}
      
      <InputWrapper $hasError={!!error}>
        <Input
          ref={ref}
          id={`input-${label}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          $hasError={!!error}
          aria-invalid={!!error}
          aria-describedby={error ? `error-${label}` : undefined}
        />
      </InputWrapper>
      
      {error && (
        <ErrorMessage id={`error-${label}`} role="alert">
          {error}
        </ErrorMessage>
      )}
    </InputContainer>
  );
});

FormInput.displayName = 'FormInput';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label<{ required?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const InputWrapper = styled.div<{ $hasError: boolean }>`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.danger : theme.colors.primary};
    transform: scaleX(0);
    transition: transform 0.2s ease;
  }
  
  &:focus-within::after {
    transform: scaleX(1);
  }
`;

const Input = styled.input<{ $hasError: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.md};
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.danger : theme.colors.primary};
    background-color: white;
    box-shadow: 0 0 0 3px ${({ theme, $hasError }) => 
      $hasError ? `${theme.colors.danger}20` : `${theme.colors.primary}20`};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundDisabled};
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }

  /* 비밀번호 필드 스타일링 */
  &[type="password"] {
    font-family: text-security-disc,serif;
    -webkit-text-security: disc;
  }
`;

const ErrorMessage = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.danger};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &::before {
    content: '⚠';
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;