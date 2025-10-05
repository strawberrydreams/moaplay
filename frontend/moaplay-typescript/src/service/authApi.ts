import axiosInstance from './core';

// ----------------------------------------------------
// TypeScript Type Definitions (백엔드와 통신을 위해 필요)
// ----------------------------------------------------

// (GET) 서버가 살아있는지 확인 (Health Check)
export const getServerStatus = async (): Promise<boolean> => {
    try {
        // 서버의 루트 경로 ('/')에 GET 요청을 보냅니다.
        const response = await axiosInstance.get('/');
        // 상태 코드가 200번대면 성공으로 간주
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        // 네트워크 오류나 CORS 오류 발생 시
        return false;
    }
};

// 회원가입 시 최종적으로 서버에 전송되는 데이터 타입
export type RegisterPayload = {
    user_id: string;
    password: string;
    email: string;
    nickname: string;
    // 선호 지역, 관심사 등 추가 정보가 필요하면 여기에 추가
};

// 중복 확인 요청 시 서버에 보내는 타입
export type DuplicateCheckPayload = {
    field: 'user_id' | 'email' | 'nickname';
    value: string;
};

// 이메일 인증 요청에 대한 응답 타입
export type VerificationResponse = {
    message: string;
};

// ----------------------------------------------------
// API 통신 함수 정의
// ----------------------------------------------------

// (GET) 아이디/이메일/닉네임 중복 확인
// 성공 시 True (사용 가능), 실패 시 False 또는 오류 응답
export const checkDuplicate = async (
    payload: DuplicateCheckPayload
): Promise<{ isAvailable: boolean }> => {
    // /user/check?field=user_id&value=testuser 형태로 요청
    const { data } = await axiosInstance.get<{ isAvailable: boolean }>('/user', {
        params: payload,
    });
    return data;
};

// // (POST) 이메일 인증 코드 전송 요청
// export const sendVerificationEmail = async (email: string): Promise<VerificationResponse> => {
//     const { data } = await axiosInstance.post<VerificationResponse>('/user/send-verification', {
//         email,
//     });
//     return data;
// };

// // (POST) 이메일 인증 코드 확인
// export const verifyEmailCode = async (
//     email: string,
//     code: string
// ): Promise<VerificationResponse> => {
//     const { data } = await axiosInstance.post<VerificationResponse>('/user/verify-code', {
//         email,
//         code,
//     });
//     return data;
// };

// (POST) 최종 회원가입 요청
export const registerUser = async (payload: RegisterPayload): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.post<{ success: boolean }>('/user', payload);
    return data;
};
