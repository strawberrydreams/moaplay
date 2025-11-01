import axiosInstance from './core/axios';
import type {LoginPayload, LoginResponse} from '../types/auth';
// ----------------------------------------------------
// TypeScript Type Definitions (백엔드와 통신을 위해 필요)
// ---------------------------------------------------- 

// (POST) 로그인 요청
export const loginUser = async (
    payload: LoginPayload
): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/login', payload);
    return data;
};

// (POST) 로그아웃 요청
export const logoutUser = async (): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.post<{ success: boolean }>('/auth/logout');
    return data;
};  

// (GET) 현재 로그인한 사용자 정보 요청
export const checkLoginStatus = async (): Promise<{ 
    id: number;
}> => {
    const { data } = await axiosInstance.get('/auth/login_test');
    return data;
};

// // (GET) 현재 로그인한 사용자 정보 요청

// export const checkLoginStatus = async (): Promise<UserResponse> => {
//     const { data } = await axiosInstance.get<UserResponse>('/users/me');
//     return data;
// };

