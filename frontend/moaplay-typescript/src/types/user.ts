export interface User {
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
    role?: string,
    updated_at: string,
}


export interface RegisterPayload {
    user_id: string,
    nickname: string,
    email: string,
    password: string,
    phone?: string,
    profile_image?: string
}

export interface DuplicateCheckPayload {
    user_id?: string,
    nickname?: string,
    email?: string
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
    password?: string;
    tags?: string[],
    profile_image?: string
}