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