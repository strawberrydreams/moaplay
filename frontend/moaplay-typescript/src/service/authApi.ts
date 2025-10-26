import axiosInstance from './core';

// ----------------------------------------------------
// TypeScript Type Definitions (백엔드와 통신을 위해 필요)
// ---------------------------------------------------- 

// (POST) 로그인 요청 시 서버에 보내는 데이터 타입
export type LoginPayload = {
    user_id: string;
    password: string;
};
// (POST) 로그인 성공 시 서버가 반환하는 데이터 타입
export type LoginResponse = {
    id: number;
    user_id: string;
};

export interface UserResponse {
    id: number;
    user_id: string;
    nickname?: string;
    profile_image?: string;
  // me.to_dict()가 반환하는 다른 필드들도 필요하면 추가
}

// ----------------------------------------------------
// API 통신 함수 정의
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

