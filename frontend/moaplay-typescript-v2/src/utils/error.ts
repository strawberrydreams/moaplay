// 공통 에러 처리 함수들의 모음

import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types';

// 에러 타입 정의 인터페이스
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

// 에러 핸들러 클래스
// 에러를 사용자 친화적인 메시지로 변환하는 클래스
export class ErrorHandler {

  // 에러를 처리하고 사용자에게 표시할 메시지를 반환하는 정적 함수
  static handle(error: unknown): AppError {
    console.error('Error occurred:', error);

    // Axios 에러인 경우
    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }

    // 일반 JavaScript 에러인 경우
    if (error instanceof Error) {
      return this.handleGenericError(error);
    }

    // 알 수 없는 에러인 경우
    return this.handleUnknownError(error);
  }

  // Axios 에러를 처리하는 정적 함수
  private static handleAxiosError(error: AxiosError): AppError {
    const response = error.response;

    if (response?.data) {
      const apiError = response.data as ApiErrorResponse;
      
      return {
        code: apiError.error?.code || 'API_ERROR',
        message: this.getLocalizedMessage(apiError.error?.code, apiError.error?.message),
        details: apiError.error?.details,
        statusCode: response.status,
      };
    }

    // 네트워크 에러인 경우
    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        statusCode: 0,
      };
    }

    // 요청 설정 에러인 경우
    return {
      code: 'REQUEST_ERROR',
      message: '요청 처리 중 오류가 발생했습니다.',
    };
  }

  // 일반 JavaScript 에러를 처리하는 정적 함수
  private static handleGenericError(error: Error): AppError {
    return {
      code: 'GENERIC_ERROR',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  // 알 수 없는 타입의 에러를 처리하는 정적 함수
  private static handleUnknownError(error: unknown): AppError {
    return {
      code: 'UNKNOWN_ERROR',
      message: '예상치 못한 오류가 발생했습니다.',
      details: { originalError: error },
    };
  }

  // Axios 에러인지 확인하는 정적 함수
  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError)?.isAxiosError === true;
  }

  // 에러 코드에 따른 한국어 메시지를 반환하는 정적 함수
  private static getLocalizedMessage(code?: string, defaultMessage?: string): string {
    const messages: Record<string, string> = {
      // 인증 관련 에러
      'UNAUTHORIZED': '로그인이 필요합니다.',
      'FORBIDDEN': '접근 권한이 없습니다.',
      'TOKEN_EXPIRED': '로그인이 만료되었습니다. 다시 로그인해주세요.',
      'INVALID_CREDENTIALS': '아이디 또는 비밀번호가 올바르지 않습니다.',
      
      // 사용자 관련 에러
      'USER_NOT_FOUND': '사용자를 찾을 수 없습니다.',
      'USERNAME_ALREADY_EXISTS': '이미 사용 중인 아이디입니다.',
      'EMAIL_ALREADY_EXISTS': '이미 사용 중인 이메일입니다.',
      
      // 행사 관련 에러
      'EVENT_NOT_FOUND': '행사를 찾을 수 없습니다.',
      'EVENT_ACCESS_DENIED': '행사에 접근할 권한이 없습니다.',
      'EVENT_ALREADY_ENDED': '이미 종료된 행사입니다.',
      
      // 리뷰 관련 에러
      'REVIEW_NOT_FOUND': '리뷰를 찾을 수 없습니다.',
      'REVIEW_ACCESS_DENIED': '리뷰에 접근할 권한이 없습니다.',
      'DUPLICATE_REVIEW': '이미 리뷰를 작성하셨습니다.',
      
      // 파일 업로드 관련 에러
      'FILE_TOO_LARGE': '파일 크기가 너무 큽니다.',
      'INVALID_FILE_TYPE': '지원하지 않는 파일 형식입니다.',
      'UPLOAD_FAILED': '파일 업로드에 실패했습니다.',
      
      // 일반적인 에러
      'VALIDATION_ERROR': '입력 정보를 확인해주세요.',
      'NOT_FOUND': '요청한 페이지를 찾을 수 없습니다.',
      'INTERNAL_SERVER_ERROR': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      'BAD_REQUEST': '잘못된 요청입니다.',
    };

    return messages[code || ''] || defaultMessage || '오류가 발생했습니다.';
  }

  // 에러에서 사용자에게 표시할 메시지를 추출하는 정적 함수
  static getErrorMessage(error: unknown): string {
    const appError = this.handle(error);
    return appError.message;
  }
}