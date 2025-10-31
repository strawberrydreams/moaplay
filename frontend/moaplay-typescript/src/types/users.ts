export interface Users {
    id: number;
    user_id: string;
    nickname?: string;
    profile_image?: string;
    created_at: string;
    statisctics: {
        events_count: number,
        reviews: number
    }

    email?: string,
    phone?: string,
    role: string,
    updated_at: string,
}

// 내 정보 가져오기 응답 타입 (GET /api/users/me)
export interface MyUserResponse {
    id: number;
    user_id: string;
    nickname: string;
    email: string;
    phone: string | null;
    profile_image: string | null;
    role: string;
    created_at: string;
    updated_at: string;
    statistics: {
        events_count: number;
        reviews: number;
    };
}

// 다른 사람 정보 가져오기 응답 타입 (GET /api/users/:id)
export interface OtherUserResponse {
    id: number;
    user_id: string;
    nickname: string;
    profile_image: string | null;
    role: string;
    created_at: string;
    statistics: {
        events_count: number;
        reviews: number;
    };
}

export interface RegisterPayload {
    user_id: string,
    nickname: string,
    email: string,
    password: string,
    phone: string,
    profile_image?: string
}

export interface DuplicateCheckPayload {
    user_id: string,
    nickname: string,
    email: string
}

export interface DeleteUserPayload {
    confirm: boolean,
    password: string
}

export interface ChangePasswordPayload {
    password: string,
    new_password: string
}

export interface ChangeUserPayload {
    nickname?: string,
    email?: string,
    phone?: string,
    profile_image?: string
}