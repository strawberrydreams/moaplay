// 사용자가 선택할 "태그" 기본 타입 (models.tag.Tag 기준)
export type Tag = {
    id: number;
    name: string;
    created_at: string; // ISO string (e.g. 2025-10-11T08:30:00Z)
};

/** 태그 목록 응답 구조 */
export interface GetTagsResponse {
  tags: Tag[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}