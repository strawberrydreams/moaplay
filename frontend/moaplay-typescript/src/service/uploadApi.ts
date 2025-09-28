import axiosInstance from './core';
import type { ImageUploadResponse } from "../types/upload.ts";

// (POST) 이미지를 서버에 업로드
// imageFile: 업로드할 File 객체
// return: 업로드된 이미지 정보
export const uploadImage = async (imageFile: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const { data } = await axiosInstance.post<ImageUploadResponse>(
        '/upload/image',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return data;
};
