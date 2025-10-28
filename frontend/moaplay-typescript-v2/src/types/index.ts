/**
 * 공통 타입 정의
 *
 * 애플리케이션 전체에서 사용되는 공통 타입과 인터페이스를 정의합니다.
 * API 응답, 페이지네이션, 에러 처리 등의 기본 타입을 포함합니다.
 */

/**
 * API 응답의 페이지네이션 정보
 */
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  limit: number;
}
/**
 * API 에러 응답 형식 (표준 형식 - 향후 통일 예정)
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
  requestId: string;
  timestamp: string;
}
/**
 * 사용자 역할 타입
 */
export type UserRole = 'guest' | 'user' | 'host' | 'admin';

/**
 * 사용자 역할 Enum (런타임에서 사용 가능)
 */
export const UserRole = {
  GUEST: 'guest' as const,
  USER: 'user' as const,
  HOST: 'host' as const,
  ADMIN: 'admin' as const,
} as const;

/**
 * 사용자 요약 정보 (다른 컴포넌트에서 참조용)
 */
export interface UserSummary {
  id: number;
  nickname: string;
  profile_image?: string;
  role: UserRole;
  username?: string;
  preferred_tags?: string[];
}

/**
 * 완전한 사용자 정보 (프로필 페이지용)
 */
export interface User extends UserSummary {
  user_id: string;
  email: string;
  phone?: string;
  username?: string;  // user_id의 별칭 (호환성)
  real_name?: string;
  phone_number?: string;  // phone의 별칭 (호환성)
  address?: string;
  preferred_tags?: string[];
  created_at: string;
  updated_at: string;
}
/**
 * Auth API - 로그인 요청
 * POST /api/auth/login 요청 바디
 */
/**
 * Auth API - 로그인 요청
 * POST /api/auth/login 요청 바디
 */
export interface LoginRequest {
  user_id: string;
  password: string;
}

/**
 * Auth API - 로그인 응답
 * POST /api/auth/login 응답 타입
 */
export interface LoginResponse {
  id: number;
  user_id: string;
  nickname: string;
  email: string;
  phone?: string;
  profile_image?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Auth API - 로그아웃 응답
 * POST /api/auth/logout 응답 타입
 */
export interface LogoutResponse {
  message: string;
}

/**
 * 행사 주최자 정보
 */
export interface EventHost extends UserSummary {
  official_email?: string;
  company_name?: string;
  is_verified?: boolean;
}
/**
 * 검색 필터 타입
 */
export interface SearchFilters {
  region?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'latest' | 'popular' | 'recommended';
}

/**
 * 검색 쿼리 파라미터
 */
export interface SearchParams extends SearchFilters {
  query?: string;
  page?: number;
  limit?: number;
}

/**
 * 로딩 상태 타입
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

/**
 * 폼 필드 에러 타입
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * 폼 검증 결과 타입
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
}
/**
 * 컴포넌트 공통 Props
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
/**
 * 버튼 Props
 */
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'small';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * 캘린더 이벤트 타입
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    isFavorite?: boolean;
    isPersonal?: boolean;
    isMyEvent?: boolean;
    type?: string;
    status?: string;
    description?: string;
    location?: string;
    host?: string;
    viewCount?: number;
    tags?: string[];
    imageUrls?: string[];
    eventId?: number;
    scheduleId?: number;
  };
}