import axiosInstance from './core/axios';
import type {
    Users,
    DuplicateCheckPayload,
    RegisterPayload,
    DeleteUserPayload,
    ChangePasswordPayload, ChangeUserPayload, MyUserResponse
} from '../types/users';

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

// ----------------------------------------------------
// API 통신 함수 정의
// ----------------------------------------------------

// (GET) 아이디/이메일/닉네임 중복 확인
// 성공 시 True (사용 가능), 실패 시 False 또는 오류 응답
export const checkDuplicate = async (
    payload: DuplicateCheckPayload
): Promise<{available: boolean}> => {
    // //users/check?type=user_id&value=testuser 형태로 요청
    const { data } = await axiosInstance.get<{available: boolean}>('/users/check/', {
        params: payload,
    });
    return data;
};

// (POST) 최종 회원가입 요청
export const registerUser = async (payload: RegisterPayload): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.post<{ success: boolean }>('/users', payload);
    return data;
};

// (PUT) 비밀번호 변경
export const changePassword = async (payload: ChangePasswordPayload): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.put<{ success: boolean }>('/users/me/password', payload);
    return data;
};

// (PUT) 내 정보 가져오기
export const getMe = async (): Promise<Users> => {
    const { data } = await axiosInstance.get<Users>('/users/me');
    return data;
};

// (GET) 유저 정보 가져오기
export const getUser = async (id : number): Promise<Users> => {
    const { data } = await axiosInstance.get<Users>(`/users/${id}`);
    return data;
};

// (PUT) 내 정보 수정 (내 프로필 업데이트)
export const updateMe = async (
    payload: ChangeUserPayload
): Promise<MyUserResponse> => {
    const { data } = await axiosInstance.put<MyUserResponse>('/users/me', payload);
    return data;
};

// (DELETE) 회원 탈퇴
export const deleteUser = async (payload: DeleteUserPayload): Promise<{success: boolean}> => {
    const {data} = await axiosInstance.delete<{success: boolean}>('/users/me/', { data: payload });
    return data;
}