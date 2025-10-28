/**
 * LoginPage 컴포넌트 스타일
 * 
 * 로그인 페이지의 모든 스타일을 정의합니다.
 * 반응형 디자인, 접근성, 폼 유효성 검사 스타일을 포함합니다.
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * 페이지 컨테이너
 */
export const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.primary} 0%, 
    ${({ theme }) => theme.colors.primaryDark} 100%
  );
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;

  /* 배경 패턴 추가 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

/**
 * 로그인 컨테이너
 */
export const LoginContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing['3xl']};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;

  /* 글래스모피즘 효과 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xl};
    margin: ${({ theme }) => theme.spacing.md};
    max-width: none;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  }

  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    border: 2px solid ${({ theme }) => theme.colors.border};
    backdrop-filter: none;
  }
`;

/**
 * 로그인 제목
 */
export const LoginTitle = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fonts.size['3xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  line-height: ${({ theme }) => theme.fonts.lineHeight.tight};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size['2xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

/**
 * 로그인 폼
 */
export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

/**
 * 에러 메시지
 */
export const ErrorMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  background-color: ${({ theme }) => theme.colors.dangerLight};
  color: ${({ theme }) => theme.colors.danger};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  text-align: center;
  position: relative;
  animation: slideIn 0.3s ease-out;

  /* 아이콘 추가 */
  &::before {
    content: '⚠️';
    margin-right: ${({ theme }) => theme.spacing.sm};
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 접근성 개선 */
  &[role="alert"] {
    /* 스크린 리더를 위한 추가 정보 */
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 성공 메시지
 */
export const SuccessMessage = styled(ErrorMessage)`
  background-color: ${({ theme }) => theme.colors.successLight || theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.success};
  border-color: ${({ theme }) => theme.colors.success};

  &::before {
    content: '✅';
  }
`;

/**
 * 구분선
 */
export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin: ${({ theme }) => theme.spacing.lg} 0;
  }
`;

/**
 * 구분선 라인
 */
export const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

/**
 * 구분선 텍스트
 */
export const DividerText = styled.span`
  padding: 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 소셜 로그인 섹션
 */
export const SocialLoginSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

/**
 * 회원가입 섹션
 */
export const SignupSection = styled.div`
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding-top: ${({ theme }) => theme.spacing.md};
  }
`;

/**
 * 회원가입 텍스트
 */
export const SignupText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  margin-right: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
    display: block;
    margin-right: 0;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

/**
 * 회원가입 링크
 */
export const SignupLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  /* 호버 시 언더라인 애니메이션 */
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary};
    transition: width ${({ theme }) => theme.transitions.fast};
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 회원가입 버튼 (모달용)
 */
export const SignupButton = styled.button`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  /* 호버 시 언더라인 애니메이션 */
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary};
    transition: width ${({ theme }) => theme.transitions.fast};
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 비밀번호 찾기 링크
 */
export const ForgotPasswordLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  text-align: center;
  display: block;
  margin-top: ${({ theme }) => theme.spacing.md};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 로딩 오버레이
 */
export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  z-index: 10;
  backdrop-filter: blur(2px);
`;

/**
 * 폼 그룹 (필드 그룹화)
 */
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

/**
 * 체크박스 그룹
 */
export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

/**
 * 체크박스 라벨
 */
export const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 로그인 옵션
 */
export const LoginOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.md} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 브랜드 로고 (상단)
 */
export const BrandLogo = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  img {
    max-width: 120px;
    height: auto;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-bottom: ${({ theme }) => theme.spacing.lg};

    img {
      max-width: 100px;
    }
  }
`;

/**
 * 푸터 링크
 */
export const FooterLinks = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: none;
    font-size: ${({ theme }) => theme.fonts.size.xs};
    margin: 0 ${({ theme }) => theme.spacing.sm};

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
      text-decoration: underline;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-top: ${({ theme }) => theme.spacing.lg};
    padding-top: ${({ theme }) => theme.spacing.md};

    a {
      display: block;
      margin: ${({ theme }) => theme.spacing.xs} 0;
    }
  }
`;

/**
 * 보안 배지
 */
export const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.textSecondary};

  &::before {
    content: '🔒';
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`;