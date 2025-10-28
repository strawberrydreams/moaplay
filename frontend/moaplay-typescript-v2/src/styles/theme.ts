/**
 * styled-components 테마 시스템
 * 
 * 애플리케이션 전체에서 사용되는 디자인 토큰과 테마를 정의합니다.
 * 색상, 폰트, 간격, 브레이크포인트 등의 디자인 시스템을 포함합니다.
 */

export const theme = {
  /**
   * 색상 팔레트
   * 브랜드 색상과 시맨틱 색상을 정의합니다.
   */
  colors: {
    // 브랜드 색상
    primary: '#007bff',
    primaryHover: '#0056b3',
    primaryDark: '#0056b3',
    primaryLight: '#e3f2fd',
    
    // 시맨틱 색상
    secondary: '#6c757d',
    secondaryDark: '#545b62',
    success: '#28a745',
    successHover: '#218838',
    successLight: '#d4edda',
    danger: '#dc3545',
    dangerDark: '#c82333',
    dangerLight: '#f8d7da',
    warning: '#ffc107',
    warningLight: '#fff3cd',
    info: '#17a2b8',
    infoLight: '#d1ecf1',
    
    // 그레이스케일
    light: '#f8f9fa',
    lighter: '#ffffff',
    dark: '#343a40',
    darker: '#212529',
    
    // 텍스트 색상
    text: '#212529',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',
    textLight: '#adb5bd',
    textDisabled: '#adb5bd',
    
    // 배경 색상
    background: '#ffffff',
    backgroundLight: '#f8f9fa',
    backgroundDark: '#e9ecef',
    backgroundDisabled: '#f5f5f5',
    backgroundHover: '#f8f9fa',
    
    // 보더 색상
    border: '#dee2e6',
    borderLight: '#e9ecef',
    borderDark: '#adb5bd',
    
    // 상태별 색상
    favorite: '#ffc107',
    personal: '#28a745',
    verified: '#007bff',
    myEvent: '#9c27b0', // 내가 작성한 행사 (보라색)
  },
  
  /**
   * 폰트 시스템
   * 폰트 패밀리, 크기, 두께를 정의합니다.
   */
  fonts: {
    primary: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'Roboto', sans-serif",
    mono: "'Fira Code', 'Monaco', monospace",
    
    size: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      small: '0.875rem',   // 14px (alias)
      md: '1rem',       // 16px
      medium: '1rem',      // 16px (alias)
      lg: '1.125rem',   // 18px
      large: '1.25rem',    // 20px (alias)
      xl: '1.25rem',    // 20px
      xlarge: '1.375rem', // 22px
      xxl: '1.5rem',    // 24px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  /**
   * 간격 시스템
   * 마진, 패딩 등에 사용되는 간격 값을 정의합니다.
   */
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  /**
   * 반응형 브레이크포인트
   * 모바일, 태블릿, 데스크톱 화면 크기를 정의합니다.
   */
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
    wide: '1440px',
  },
  
  /**
   * 그림자 시스템
   * 카드, 모달 등에 사용되는 그림자 효과를 정의합니다.
   */
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  /**
   * 보더 반지름
   * 버튼, 카드 등의 모서리 둥글기를 정의합니다.
   */
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  /**
   * 애니메이션 및 트랜지션
   * 호버, 포커스 등의 상태 변화에 사용되는 트랜지션을 정의합니다.
   */
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
  },
  
  /**
   * z-index 레이어
   * 모달, 드롭다운 등의 레이어 순서를 정의합니다.
   */
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

/**
 * 테마 타입 정의
 * TypeScript에서 테마 객체의 타입을 추론할 수 있도록 합니다.
 */
export type Theme = typeof theme;