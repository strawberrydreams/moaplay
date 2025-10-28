/**
 * 스타일 유틸리티 함수들
 * 
 * 재사용 가능한 스타일 헬퍼 함수와 믹스인을 정의합니다.
 * 일관된 스타일링과 코드 재사용성을 높이기 위해 사용됩니다.
 */

import { css, RuleSet } from 'styled-components';
import { Theme } from './theme';

/**
 * 반응형 브레이크포인트 헬퍼
 */
export const media = {
  mobile: (styles: RuleSet<object>) => css`
    @media (max-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.mobile}) {
      ${styles}
    }
  `,
  tablet: (styles: RuleSet<object>) => css`
    @media (max-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.tablet}) {
      ${styles}
    }
  `,
  desktop: (styles: RuleSet<object>) => css`
    @media (max-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.desktop}) {
      ${styles}
    }
  `,
  wide: (styles: RuleSet<object>) => css`
    @media (min-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.wide}) {
      ${styles}
    }
  `,
};

/**
 * 접근성 관련 유틸리티
 */
export const a11y = {
  /**
   * 스크린 리더 전용 텍스트
   */
  srOnly: css`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `,

  /**
   * 포커스 가능한 요소의 기본 포커스 스타일
   */
  focusVisible: css`
    &:focus-visible {
      outline: 2px solid ${({ theme }: { theme: Theme }) => theme.colors.primary};
      outline-offset: 2px;
      border-radius: ${({ theme }: { theme: Theme }) => theme.borderRadius.sm};
    }
  `,

  /**
   * 고대비 모드 지원
   */
  highContrast: (styles: RuleSet<object>) => css`
    @media (prefers-contrast: more) {
      ${styles}
    }
  `,

  /**
   * 모션 감소 모드 지원
   */
  reducedMotion: (styles: RuleSet<object>) => css`
    @media (prefers-reduced-motion: reduce) {
      ${styles}
    }
  `,
};

/**
 * 레이아웃 유틸리티
 */
export const layout = {
  /**
   * Flexbox 중앙 정렬
   */
  flexCenter: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  /**
   * Flexbox 세로 중앙 정렬
   */
  flexCenterVertical: css`
    display: flex;
    align-items: center;
  `,

  /**
   * Flexbox 가로 중앙 정렬
   */
  flexCenterHorizontal: css`
    display: flex;
    justify-content: center;
  `,

  /**
   * Grid 중앙 정렬
   */
  gridCenter: css`
    display: grid;
    place-items: center;
  `,

  /**
   * 절대 위치 중앙 정렬
   */
  absoluteCenter: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,

  /**
   * 전체 화면 오버레이
   */
  fullScreenOverlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: ${({ theme }: { theme: Theme }) => theme.zIndex.modal};
  `,

  /**
   * 컨테이너 최대 너비
   */
  container: css`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${({ theme }: { theme: Theme }) => theme.spacing.lg};

    ${media.mobile(css`
      padding: 0 ${({ theme }: { theme: Theme }) => theme.spacing.md};
    `)}
  `,
};

/**
 * 텍스트 유틸리티
 */
export const text = {
  /**
   * 텍스트 말줄임
   */
  ellipsis: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  /**
   * 여러 줄 텍스트 말줄임
   */
  multiLineEllipsis: (lines: number = 2) => css`
    display: -webkit-box;
    -webkit-line-clamp: ${lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  `,

  /**
   * 텍스트 선택 방지
   */
  noSelect: css`
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  `,

  /**
   * 단어 줄바꿈
   */
  wordBreak: css`
    word-break: break-word;
    overflow-wrap: break-word;
  `,
};

/**
 * 애니메이션 유틸리티
 */
export const animation = {
  /**
   * 페이드 인 애니메이션
   */
  fadeIn: css`
    animation: fadeIn 0.3s ease-out;

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    ${a11y.reducedMotion(css`
      animation: none;
    `)}
  `,

  /**
   * 슬라이드 업 애니메이션
   */
  slideUp: css`
    animation: slideUp 0.3s ease-out;

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    ${a11y.reducedMotion(css`
      animation: none;
    `)}
  `,

  /**
   * 스케일 애니메이션
   */
  scaleIn: css`
    animation: scaleIn 0.2s ease-out;

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    ${a11y.reducedMotion(css`
      animation: none;
    `)}
  `,

  /**
   * 호버 시 상승 효과
   */
  hoverLift: css`
    transition: transform ${({ theme }: { theme: Theme }) => theme.transitions.fast};

    &:hover {
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }

    ${a11y.reducedMotion(css`
      transition: none;
      
      &:hover {
        transform: none;
      }
    `)}
  `,
};

/**
 * 그림자 유틸리티
 */
export const shadows = {
  /**
   * 카드 그림자
   */
  card: css`
    box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.sm};
    
    &:hover {
      box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.md};
    }
  `,

  /**
   * 모달 그림자
   */
  modal: css`
    box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.xl};
  `,

  /**
   * 드롭다운 그림자
   */
  dropdown: css`
    box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.lg};
  `,
};

/**
 * 스크롤바 스타일링
 */
export const scrollbar = {
  /**
   * 기본 스크롤바 스타일
   */
  default: css`
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: ${({ theme }: { theme: Theme }) => theme.colors.backgroundLight};
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }: { theme: Theme }) => theme.colors.border};
      border-radius: ${({ theme }: { theme: Theme }) => theme.borderRadius.sm};
    }

    &::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }: { theme: Theme }) => theme.colors.borderDark};
    }
  `,

  /**
   * 얇은 스크롤바
   */
  thin: css`
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }: { theme: Theme }) => theme.colors.borderLight};
      border-radius: ${({ theme }: { theme: Theme }) => theme.borderRadius.sm};
    }

    &::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }: { theme: Theme }) => theme.colors.border};
    }
  `,
};

/**
 * 버튼 상태 유틸리티
 */
export const buttonStates = {
  /**
   * 기본 버튼 상태
   */
  default: css`
    cursor: pointer;
    transition: all ${({ theme }: { theme: Theme }) => theme.transitions.fast};

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.sm};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }

    ${a11y.focusVisible}
    ${a11y.reducedMotion(css`
      transition: none;
      
      &:hover:not(:disabled) {
        transform: none;
      }
    `)}
  `,

  /**
   * 로딩 상태
   */
  loading: css`
    cursor: wait;
    pointer-events: none;
  `,
};

/**
 * 카드 스타일 유틸리티
 */
export const card = {
  /**
   * 기본 카드 스타일
   */
  default: css`
    background: ${({ theme }: { theme: Theme }) => theme.colors.background};
    border-radius: ${({ theme }: { theme: Theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.sm};
    border: 1px solid ${({ theme }: { theme: Theme }) => theme.colors.border};
    overflow: hidden;
    transition: all ${({ theme }: { theme: Theme }) => theme.transitions.fast};

    &:hover {
      box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.md};
    }

    ${a11y.reducedMotion(css`
      transition: none;
    `)}
  `,

  /**
   * 인터랙티브 카드
   */
  interactive: css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.lg};
    }

    &:active {
      transform: translateY(0);
    }

    ${a11y.focusVisible}
    ${a11y.reducedMotion(css`
      &:hover {
        transform: none;
      }
    `)}
  `,
};

/**
 * 폼 관련 유틸리티
 */
export const form = {
  /**
   * 기본 입력 필드 스타일
   */
  input: css`
    width: 100%;
    padding: ${({ theme }: { theme: Theme }) => theme.spacing.sm} ${({ theme }: { theme: Theme }) => theme.spacing.md};
    border: 2px solid ${({ theme }: { theme: Theme }) => theme.colors.border};
    border-radius: ${({ theme }: { theme: Theme }) => theme.borderRadius.md};
    font-family: ${({ theme }: { theme: Theme }) => theme.fonts.primary};
    font-size: ${({ theme }: { theme: Theme }) => theme.fonts.size.md};
    color: ${({ theme }: { theme: Theme }) => theme.colors.textPrimary};
    background-color: ${({ theme }: { theme: Theme }) => theme.colors.background};
    transition: all ${({ theme }: { theme: Theme }) => theme.transitions.fast};

    &:focus {
      outline: none;
      border-color: ${({ theme }: { theme: Theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }: { theme: Theme }) => theme.colors.primaryLight};
    }

    &:disabled {
      background-color: ${({ theme }: { theme: Theme }) => theme.colors.backgroundDisabled};
      color: ${({ theme }: { theme: Theme }) => theme.colors.textDisabled};
      cursor: not-allowed;
    }

    ${a11y.highContrast(css`
      border-width: 3px;
    `)}
  `,

  /**
   * 에러 상태 입력 필드
   */
  inputError: css`
    border-color: ${({ theme }: { theme: Theme }) => theme.colors.danger};
    
    &:focus {
      border-color: ${({ theme }: { theme: Theme }) => theme.colors.danger};
      box-shadow: 0 0 0 3px ${({ theme }: { theme: Theme }) => theme.colors.dangerLight};
    }
  `,
};