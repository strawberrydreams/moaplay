// src/services/tagsApi.ts
import axiosInstance from "./core/axios";
import type { Tag, GetTagsResponse } from "../types/tags";

export const tagsApi = {
  /** 태그 전체 목록 조회 */
  async list(
    page: number = 1,
    per_page: number = 100,
    search?: string
  ): Promise<Tag[]> {
    const params: Record<string, string | number> = { page, per_page };
    if (search) params.search = search;

    const { data } = await axiosInstance.get<GetTagsResponse>("/tags", { params });

    // data.tags가 존재할 때만 반환
    if (Array.isArray(data?.tags)) {
      return data.tags;
    } else {
      console.warn("Unexpected tags API response:", data);
      return [];
    }
  },

  /** 태그 생성 (관리자/운영툴) */
  async create(name: string): Promise<Tag> {
    if (!name.trim()) throw new Error("태그 이름은 비어 있을 수 없습니다.");
    const { data } = await axiosInstance.post<Tag>("/tags", { name });
    return data;
  },

  /** 태그 삭제 (관리자/운영툴) */
  async delete(tagId: number): Promise<void> {
    await axiosInstance.delete(`/tags/${tagId}`);
  },
};

