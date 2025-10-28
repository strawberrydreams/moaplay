/**
 * 공통 버튼 컴포넌트
 * 
 * 다양한 스타일과 상태를 지원하는 재사용 가능한 버튼 컴포넌트입니다.
 */

import React from 'react';
import { ButtonProps } from '../../types';
import {
  StyledButton,
  LoadingSpinner,
  ButtonContent,
} from '../../styles/components';

/**
 * 공통 버튼 컴포넌트
 * 
 * 다양한 변형(variant), 크기(size), 상태(loading, disabled)를 지원합니다.
 * 접근성을 고려한 키보드 내비게이션과 스크린 리더 지원을 포함합니다.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className
}) => {
  /**
   * 버튼 클릭 처리
   */
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  // Spinner용 사이즈 정규화: 'small' -> 'sm'
  const sizeMap = {
    small: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  } as const;
  const spinnerSize = sizeMap[size];

  // StyledButton용 variant 정규화: 'success' -> 'primary'
  const variantMap = {
    success: 'primary',
    primary: 'primary',
    secondary: 'secondary',
    danger: 'danger',
    outline: 'outline',
  } as const;
  const styledVariant = variantMap[variant];

  return (
    <StyledButton
      type={type}
      $variant={styledVariant}
      $size={spinnerSize}
      $loading={loading}
      disabled={disabled || loading}
      onClick={handleClick}
      className={className}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading && <LoadingSpinner $size={spinnerSize} />}
      <ButtonContent $loading={loading}>
        {children}
      </ButtonContent>
    </StyledButton>
  );
};
