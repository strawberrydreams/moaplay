// 사용자가 선택할 "태그" 기본 타입 (models.tag.Tag 기준)
export type Tag = {
    id: number;
    name: string;
    created_at: string; // ISO string (e.g. 2025-10-11T08:30:00Z)
};

// 태그 선택 UI에서 쓰기 좋은 헬퍼 타입
export type SelectableTag = Tag & {
    selected?: boolean;
};

// 사용자 선호 태그 저장 페이로드
export type UserPreferredTagsPayload = {
    tags: number[]; // 최소 3개 이상 권장(프론트/서버에서 검증)
};

// 서버가 선호 태그 저장 후 돌려줄 때 쓸 수 있는 응답 타입(예시)
export type UserPreferredTagsResponse = {
    user_id: number;
    tags: number[];
    updated_at: string;
};