/**
 * Axios 인스턴스 및 인터셉터 설정
 *
 * API 통신을 위한 공통 axios 인스턴스를 생성하고,
 * 세션 기반 인증, 에러 처리, 요청/응답 인터셉터를 설정합니다.
 *
 * 🔑 세션 기반 인증:
 * - localStorage/sessionStorage 대신 HttpOnly 세션 쿠키 사용
 * - XSS 공격으로부터 안전
 * - 서버에서 자동으로 세션 쿠키 설정/삭제
 * - withCredentials: true 옵션으로 세션 쿠키 자동 전송
 */

import axios, { AxiosInstance } from 'axios';
import { setupCookieAuth } from './interceptors';

// dev에서는 Vite 프록시를 타도록 기본값을 빈 문자열로 두고,
// 배포나 별도 환경에서는 VITE_API_URL이 있으면 그걸 사용
const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * 기본 API 클라이언트 인스턴스
 *
 * 백엔드 API와 통신하기 위한 axios 인스턴스입니다.
 * 기본 URL, 타임아웃, 공통 헤더 등을 설정합니다.
 *
 * 🔑 withCredentials: true - 세션 쿠키를 자동으로 포함하여 전송
 *
 * 세션 기반 인증 설정:
 * - baseURL: 환경 변수 또는 기본값 사용
 * - withCredentials: true - 세션 쿠키 자동 전송 (필수)
 * - timeout: 10초
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔑 세션 기반 인증을 위해 필수!
});

// 쿠키 기반 인증 인터셉터 설정
setupCookieAuth(apiClient);

/**
 * 파일 업로드용 axios 인스턴스
 *
 * 파일 업로드 시 사용하는 별도의 axios 인스턴스입니다.
 * Content-Type을 multipart/form-data로 설정하고 타임아웃을 늘립니다.
 */
// ⚠️ multipart/form-data는 브라우저가 boundary를 포함해 자동으로 설정하므로 수동 지정하지 않음
export const uploadClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 파일 업로드는 더 긴 타임아웃
  headers: {
  },
  withCredentials: true, // 🔑 세션 기반 인증을 위해 필수!
});

// 업로드 클라이언트에도 동일한 인터셉터 적용
setupCookieAuth(uploadClient);