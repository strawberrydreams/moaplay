/**
 * Axios 인터셉터 설정
 * 
 * 세션 기반 인증과 에러 처리를 담당하는 인터셉터를 정의합니다.
 * 
 * 🔑 세션 기반 인증의 장점:
 * - localStorage 사용 안 함 → XSS 공격으로부터 안전
 * - HttpOnly 세션 쿠키 → JavaScript로 접근 불가
 * - 서버에서 자동으로 세션 쿠키 관리
 * - 토큰 저장/삭제 로직 불필요
 * - 401 에러 시 자동으로 로그인 페이지로 리다이렉트
 */

import { AxiosResponse, AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: number;
      skipAuthInterceptor?: boolean;
    };
    _retry?: boolean;
  }
}

const isAuthPath = (url?: string) => !!url && (/\/api\/auth\//.test(url));
/**
 * 요청 인터셉터
 *
 * 🔑 세션 기반 인증에서는 Authorization 헤더 불필요
 * 브라우저가 자동으로 세션 쿠키를 포함하여 요청을 보냄
 *
 * withCredentials: true 설정으로 모든 요청에 세션 쿠키가 자동으로 포함됨
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // 특정 요청은 인증 인터셉터를 스킵
  if (config.metadata?.skipAuthInterceptor) {
    return config;
  }

  // 모든 요청에 세션 쿠키 포함 (cross-origin 대비)
  config.withCredentials = true;

  // 🔑 세션 기반 인증: Authorization 헤더 설정 불필요
  // withCredentials: true 설정으로 브라우저가 자동으로 세션 쿠키 전송

  // 요청 시작 시간 기록 (디버깅용)
  if (config.metadata) {
    config.metadata.startTime = new Date().getTime();
  } else {
    config.metadata = { startTime: new Date().getTime() };
  }

  return config;
};

/**
 * 요청 에러 인터셉터
 */
export const requestErrorInterceptor = (error: AxiosError): Promise<AxiosError> => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
};

/**
 * 응답 성공 인터셉터
 *
 * API 응답을 처리하고 응답 시간을 로깅합니다.
 */
export const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // 응답 시간 계산 (디버깅용)
  if (response.config.metadata?.startTime) {
    const endTime = new Date().getTime();
    const duration = endTime - response.config.metadata.startTime;
    console.debug(`API Request to ${response.config.url} took ${duration}ms`);
  }

  return response;
};

/**
 * 응답 에러 인터셉터 팩토리
 *
 * 🔑 세션 기반 인증에서의 에러 처리:
 * - 401 에러 발생 시 로그인 페이지로 리다이렉트
 * - 세션이 만료되었거나 인증이 필요한 경우
 * - 에러 응답 형식을 표준화하여 처리
 *
 */

export const createResponseErrorInterceptor = () => async (error: AxiosError): Promise<never> => {
  const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean; metadata?: { skipAuthInterceptor?: boolean; startTime?: number } });

  // 스킵 플래그나 인증 경로면 건너뜀
  if (originalRequest?.metadata?.skipAuthInterceptor || isAuthPath(originalRequest?.url)) {
    logApiError(error);
    return Promise.reject(error);
  }

  // 401 Unauthorized 에러 처리 (인증 실패만 처리)
  if (error.response?.status === 401) {
    // 세션이 만료되었거나 인증이 필요한 경우
    console.warn('Authentication required: Session expired or not authenticated');
    await handleAuthenticationFailure();
    return Promise.reject(error);
  }

  // 404, 403 등 다른 에러는 로그아웃 처리하지 않음
  // 단순히 로깅만 하고 에러를 전파
  logApiError(error);
  return Promise.reject(error);
};

/**
 * 인증 실패 처리
 *
 * 🔑 세션 기반 인증: 로그인 페이지로 리다이렉트
 *
 * 401 에러 발생 시:
 * 1. 현재 경로를 저장 (로그인 후 복귀용)
 * 2. 로그인 페이지로 리다이렉트
 * 3. 중복 리다이렉트 방지
 */
const handleAuthenticationFailure = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  // 중복 리다이렉트 방지
  if (sessionStorage.getItem('redirectingToLogin')) {
    return;
  }

  // 현재 경로 저장 (로그인 후 복귀용)
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/signup') {
    try {
      localStorage.setItem('redirectAfterLogin', currentPath);
    } catch (error) {
      console.warn('Failed to save redirect path:', error);
    }
  }

  // 리다이렉트 플래그 설정
  sessionStorage.setItem('redirectingToLogin', '1');

  // 홈페이지로 리다이렉트 (로그인 모달 자동 표시)
  window.location.href = '/?showLoginModal=true';
};

/**
 * API 에러 응답 타입 정의
 */
interface ApiErrorData {
  error?: string | {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
  code?: string;
  requestId?: string;
}

/**
 * API 에러 로깅
 *
 * 백엔드 API 에러 응답 형식을 파싱하여 로깅합니다.
 *
 * 에러 응답 형식:
 * {
 *   "error": "에러 메시지",
 *   "code": "ERROR_CODE"
 * }
 *
 * 또는
 *
 * {
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "에러 메시지",
 *     "details": {}
 *   },
 *   "requestId": "req_123456789"
 * }
 *
 * @param error Axios 에러 객체
 */
const logApiError = (error: AxiosError): void => {
  if (error.response) {
    const responseData = error.response.data as ApiErrorData;

    // 에러 정보 추출
    let errorMessage = 'Unknown error';
    let errorCode = 'UNKNOWN_ERROR';

    if (responseData) {
      // 형식 1: { error: "message", code: "CODE" }
      if (typeof responseData.error === 'string') {
        errorMessage = responseData.error;
        errorCode = responseData.code || 'UNKNOWN_ERROR';
      }
      // 형식 2: { error: { code, message, details }, requestId }
      else if (typeof responseData.error === 'object') {
        errorMessage = responseData.error.message || 'Unknown error';
        errorCode = responseData.error.code || 'UNKNOWN_ERROR';
      }
    }

    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response.status,
      code: errorCode,
      message: errorMessage,
      requestId: responseData?.requestId,
    });
  } else if (error.request) {
    console.error('Network Error:', {
      message: error.message,
      url: error.config?.url,
    });
  } else {
    console.error('Request Setup Error:', {
      message: error.message,
    });
  }
};

/**
 * 세션 기반 인증 설정
 *
 * 주어진 axios 인스턴스에 세션 기반 인증 인터셉터를 설정합니다.
 *
 * 🔑 세션 기반 인증의 핵심:
 * - withCredentials: true 설정으로 세션 쿠키 자동 전송
 * - Authorization 헤더 불필요
 * - 서버가 세션 쿠키 관리
 * - 401 에러 시 로그인 페이지로 리다이렉트
 */
export const setupCookieAuth = (axiosInstance: AxiosInstance): void => {
  // 중복 설치 방지
  if ((axiosInstance as any).__cookieAuthInstalled) return;
  (axiosInstance as any).__cookieAuthInstalled = true;

  // 기본적으로 쿠키 포함
  axiosInstance.defaults.withCredentials = true;

  // 요청 인터셉터 설정
  axiosInstance.interceptors.request.use(
    requestInterceptor,
    requestErrorInterceptor
  );

  // 응답 인터셉터 설정
  axiosInstance.interceptors.response.use(
    responseInterceptor,
    createResponseErrorInterceptor()
  );
};