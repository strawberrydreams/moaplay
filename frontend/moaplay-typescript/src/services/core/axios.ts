import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// =================================================================
// API 요청을 보낼 axios 인스턴스를 생성하고, 모든 요청에 JWT 토큰을 자동으로 추가하는 인터셉터를 설정하는 파일
// =================================================================

// API의 기본 URL, 다른 곳에서 /api 명시 생략 가능
const API_BASE_URL = '/api';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: 모든 API 요청에 인증 토큰 추가
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // JWT 토큰 가져오기
        const token = localStorage.getItem('jwt_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (옵션): 에러 처리 등 수행
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401 에러 시 로그인 페이지로 보냄
        if (error.response?.status === 401) {
            console.error('Unauthorized! Redirecting to login...');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
