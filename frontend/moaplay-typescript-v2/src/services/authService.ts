/**
 * 인증 관련 API 서비스
 * 
 * 로그인, 로그아웃, 회원가입 등 인증 기능 API 호출을 담당합니다.
 * 
 * API 문서: docs/api/Auth API 문서.md, docs/api/User API 문서.md
 * Base URL: /api/auth, /api/users
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

import { apiClient } from './core/axios';
import { LoginRequest, LoginResponse, LogoutResponse } from '../types/auth';
import { UserSignupRequest, UserSignupResponse, UserCheckResponse, UserMeResponse } from '../types/users';

/**
 * 인증 서비스 클래스
 * 
 * Auth API 엔드포인트와 매핑되는 메서드를 제공합니다.
 * 세션 기반 인증을 사용하며, 쿠키를 통해 세션 ID를 관리합니다.
 * 
 * API 명세: docs/api/Auth API 문서.md, docs/api/User API 문서.md
 * Requirements: 2.1, 2.2
 */
export class AuthService {
  /**
   * 로그인
   * POST /api/auth/login
   * 
   * 사용자 인증 후 세션을 생성하고 세션 ID를 쿠키로 반환합니다.
   * 클라이언트는 withCredentials: true 설정으로 쿠키를 자동으로 포함시켜야 합니다.
   * 
   * 세션 기반 인증:
   * - 서버에서 세션 생성 후 세션 ID를 쿠키로 반환
   * - 클라이언트는 세션 쿠키를 자동으로 저장
   * - 이후 요청 시 쿠키 자동 포함 (withCredentials: true)
   * 
   * @param data 로그인 정보 (user_id, password)
   * @returns 로그인 성공 시 사용자 ID와 user_id
   * @throws {Error} 401 - 아이디 또는 비밀번호가 올바르지 않습니다
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  }

  /**
   * 로그아웃
   * POST /api/auth/logout
   * 
   * 서버에서 세션 정보를 삭제하고 세션 쿠키를 무효화합니다.
   * 
   * 세션 삭제:
   * - 서버에서 세션 정보 삭제
   * - 세션 쿠키 무효화
   * - 클라이언트는 로그인 페이지로 리다이렉트 또는 인증 상태 초기화
   * 
   * @returns 로그아웃 성공 메시지
   * @throws {Error} 401 - 인증이 필요합니다
   */
  static async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/api/auth/logout');
    return response.data;
  }

  /**
   * Google OAuth 로그인 (향후 구현 예정)
   * POST /api/auth/google
   * 
   * @param credential Google OAuth credential
   * @returns 로그인 성공 시 사용자 정보
   */
  static async googleLogin(credential: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/google', { credential });
    return response.data;
  }

  /**
   * Kakao OAuth 로그인 (향후 구현 예정)
   * POST /api/auth/kakao
   * 
   * @param accessToken Kakao OAuth access token
   * @returns 로그인 성공 시 사용자 정보
   */
  static async kakaoLogin(accessToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/kakao', { access_token: accessToken });
    return response.data;
  }

  /**
   * 회원가입
   * POST /api/users/
   * 
   * 새로운 사용자를 등록합니다.
   * 
   * 유효성 검증 규칙:
   * - user_id: 4-50자, 영문+숫자+언더스코어 (^[a-zA-Z0-9_]{4,50}$)
   * - password: 최소 8자 이상
   * - nickname: 2-100자
   * - email: 이메일 형식, 최대 255자
   * 
   * @param data 회원가입 정보
   * @returns 생성된 사용자 정보
   * @throws {Error} 400 - 필수 필드 누락 또는 유효성 검증 실패
   * @throws {Error} 409 - 중복된 user_id, nickname, email
   */
  static async signup(data: UserSignupRequest): Promise<UserSignupResponse> {
    const response = await apiClient.post<UserSignupResponse>('/api/users/', data);
    return response.data;
  }

  /**
   * 아이디 중복 확인
   * GET /api/users/check?type=user_id&value={username}
   * 
   * 회원가입 시 아이디 중복 여부를 확인합니다.
   * 
   * @param username 확인할 아이디
   * @returns 사용 가능 여부와 메시지
   * @throws {Error} 400 - 잘못된 요청
   */
  static async checkUsername(username: string): Promise<UserCheckResponse> {
    const response = await apiClient.get<UserCheckResponse>('/api/users/check', {
      params: { type: 'user_id', value: username }
    });
    return response.data;
  }

  /**
   * 현재 로그인한 사용자 정보 조회
   * GET /api/users/me
   * 
   * 세션 기반 인증으로 현재 사용자 정보를 가져옵니다.
   * 
   * @returns 현재 사용자 정보
   * @throws {Error} 401 - 인증이 필요합니다
   */
  static async getCurrentUser(): Promise<UserMeResponse> {
    const response = await apiClient.get<UserMeResponse>('/api/users/me');
    return response.data;
  }
}
