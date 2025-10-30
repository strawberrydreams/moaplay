import axiosInstance from './core';
import type { ImageUploadResponse, ImagesUploadResponse } from "../types/upload.ts";

// 이미지 업로드 API 처리 부분 (단일/다중)

// 단일 이미지 업로드 함수 (POST)
export const uploadImage = async (imageFile: File): Promise<ImageUploadResponse> => {
  const formData = toFormDataSingle(imageFile);
  const { data } = await axiosInstance.post<ImageUploadResponse>(
      '/upload/image',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data;
};

// 다중 이미지 업로드 함수 (POST)
export const uploadImages = async (imageFiles: File[]): Promise<ImagesUploadResponse> => {
  const formData = toFormDataMulti(imageFiles);
  const { data } = await axiosInstance.post<ImagesUploadResponse>(
      '/upload/image',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data;
};

// 단일 이미지를 FormData로 포맷팅
export const toFormDataSingle = (file: File, fieldName: string = 'image'): FormData => {
    const fd = new FormData();
    // 파일명까지 명시해주면 서버에서 원본 이름을 활용할 수 있음
    fd.append(fieldName, file, file.name);
    return fd;
};

// 다중 이미지를 FormData로 포맷팅
export const toFormDataMulti = (files: File[], fieldName: string = 'images'): FormData => {
    const fd = new FormData();
    files.forEach(f => fd.append(fieldName, f, f.name));
    return fd;
};