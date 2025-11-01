import axiosInstance from './core/axios'; // 공용 Axios 인스턴스 (이미 프로젝트에 존재)

import type {
    Tag,
    UserPreferredTagsPayload,
    UserPreferredTagsResponse,
} from '../types/tags';

// TODO: Tag API 구현
/**
 * 태그 관련 API
 * 백엔드 Flask Blueprint가 /api/tags 로 마운트되어 있다고 가정.
 * - POST /api/tags           : 태그 생성 (routes_tag.py에 존재)
 * - GET  /api/tags           : 태그 목록 (백엔드에 리스트 라우트 추가 필요 시 구현)
 *
 * 사용자 선호 태그 저장:
 * - POST /api/users/:userId/preferences/tags  : { tag_ids: number[] }
 *   -> 백엔드 라우트 추가 필요(이름은 예시). BFF 쓰면 BFF 경로에 맞춰 바꿔도 됨.
 */
export const tagsApi = {
    /** 태그 전체 목록 */
    async list(): Promise<Tag[]> {
        const { data } = await axiosInstance.get('/api/tags');
        // data: Tag[]
        return data;
    },

    /** 태그 생성 (관리자/운영툴에서 사용) */
    async create(name: string): Promise<Tag> {
        const { data } = await axiosInstance.post('/api/tags', { name });
        // data: Tag
        return data;
    },

    /**
     * 사용자 선호 태그 저장
     * - 최소 3개 보장은 프론트에서 1차 체크, 서버에서도 2차 체크 권장
     */
    async saveUserPreferredTags(
        userId: number,
        payload: UserPreferredTagsPayload
    ): Promise<UserPreferredTagsResponse> {
        if (!Array.isArray(payload.tag_ids) || payload.tag_ids.length < 3) {
            throw new Error('선호 태그는 최소 3개 이상 선택해야 해.');
        }
        const { data } = await axiosInstance.post(
            `/api/users/${userId}/preferences/tags`,
            payload
        );
        // data: UserPreferredTagsResponse
        return data;
    },
};