/**
 * 파일 업로드 관리 훅
 * 
 * @deprecated 이 훅은 더 이상 사용되지 않습니다.
 * 파일 업로드는 이제 Event/Review Service에서 multipart/form-data 방식으로 처리됩니다.
 * 
 * 파일 업로드 상태 관리, 배치 업로드, 에러 처리 등을 제공하는 커스텀 훅입니다.
 * 
 * 주요 기능:
 * - 파일 업로드 상태 관리
 * - 배치 업로드 처리
 * - 업로드 진행률 추적
 * - 에러 처리 및 재시도
 * - 파일 검증
 */

import React, { useState, useCallback, useRef } from 'react';

/**
 * 파일 유틸리티 함수들
 */
const FileUtils = {
  isImageFile(file: File): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type);
  },
  
  isDocumentFile(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/sword',
      'application/vnd.malformations-office document.multiprocessing.document',
      'application/x-hwp',
      'text/plain'
    ];
    const documentExtensions = ['.pdf', '.doc', '.docx', '.hwp', '.txt'];
    return documentTypes.includes(file.type) || 
           documentExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }
};

/**
 * 업로드 파일 정보
 */
export interface UploadFile {
  id: string;
  file: File;
  url?: string;
  filename: string;
  size: number;
  type: 'image' | 'document' | 'unknown';
  mimeType: string;
  isUploading: boolean;
  uploadProgress: number;
  error?: string;
  uploadSpeed?: number;
  remainingTime?: number;
  uploadedUrl?: string;
}

/**
 * 업로드 통계
 */
export interface UploadStatistics {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  uploadingFiles: number;
  totalSize: number;
  uploadedSize: number;
  overallProgress: number;
  averageSpeed: number;
  estimatedTimeRemaining: number;
}

/**
 * 업로드 옵션
 */
export interface UploadOptions {
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  autoUpload?: boolean;
  concurrent?: boolean;
  maxConcurrent?: number;
}

/**
 * 파일 업로드 훅
 */
export const useFileUpload = (options: UploadOptions = {}) => {
  const {
    maxFiles = 10,
    maxFileSize = 16 * 1024 * 1024, // 16MB
    allowedTypes = [],
    allowedExtensions = [],
    autoUpload = true,
    concurrent = true,
    maxConcurrent = 3
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [statistics, setStatistics] = useState<UploadStatistics>({
    totalFiles: 0,
    completedFiles: 0,
    failedFiles: 0,
    uploadingFiles: 0,
    totalSize: 0,
    uploadedSize: 0,
    overallProgress: 0,
    averageSpeed: 0,
    estimatedTimeRemaining: 0
  });

  const uploadStartTimeRef = useRef<number>(0);
  const activeUploadsRef = useRef<Set<string>>(new Set());

  /**
   * 파일 타입 감지
   */
  const detectFileType = (file: File): 'image' | 'document' | 'unknown' => {
    if (FileUtils.isImageFile(file)) return 'image';
    if (FileUtils.isDocumentFile(file)) return 'document';
    return 'unknown';
  };

  /**
   * 파일 검증
   */
  const validateFile = useCallback((file: File): string | null => {
    // 파일 개수 검증
    if (files.length >= maxFiles) {
      return `최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`;
    }

    // 파일 크기 검증
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      return `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`;
    }

    // MIME 타입 검증
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${allowedTypes.join(', ')})`;
    }

    // 확장자 검증
    if (allowedExtensions.length > 0) {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        return `허용된 확장자: ${allowedExtensions.join(', ')}`;
      }
    }

    // 중복 파일 검증
    const isDuplicate = files.some(f => 
      f.filename === file.name && f.size === file.size
    );
    if (isDuplicate) {
      return '이미 추가된 파일입니다.';
    }

    return null;
  }, [files, maxFiles, maxFileSize, allowedTypes, allowedExtensions]);

  /**
   * 통계 업데이트
   */
  const updateStatistics = useCallback(() => {
    const totalFiles = files.length;
    const completedFiles = files.filter(f => !f.isUploading && !f.error && f.uploadedUrl).length;
    const failedFiles = files.filter(f => f.error).length;
    const uploadingFiles = files.filter(f => f.isUploading).length;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    
    let uploadedSize = 0;
    let totalSpeed = 0;
    let speedCount = 0;

    files.forEach(file => {
      if (file.isUploading) {
        uploadedSize += (file.size * file.uploadProgress) / 100;
        if (file.uploadSpeed) {
          totalSpeed += file.uploadSpeed;
          speedCount++;
        }
      } else if (file.uploadedUrl) {
        uploadedSize += file.size;
      }
    });

    const overallProgress = totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;
    const averageSpeed = speedCount > 0 ? totalSpeed / speedCount : 0;
    const remainingSize = totalSize - uploadedSize;
    const estimatedTimeRemaining = averageSpeed > 0 ? Math.ceil(remainingSize / averageSpeed) : 0;

    setStatistics({
      totalFiles,
      completedFiles,
      failedFiles,
      uploadingFiles,
      totalSize,
      uploadedSize,
      overallProgress,
      averageSpeed,
      estimatedTimeRemaining
    });
  }, [files]);

  /**
   * 개별 파일 업로드
   */
  const uploadSingleFile = useCallback(async (fileId: string): Promise<void> => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.isUploading || file.uploadedUrl) return;

    activeUploadsRef.current.add(fileId);

    // 업로드 시작 상태로 업데이트
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, isUploading: true, uploadProgress: 0, error: undefined }
        : f
    ));

    try {
      // NOTE: 실제 업로드는 더 이상 여기서 하지 않습니다.
      // 파일 객체만 관리하고, 실제 업로드는 Event/Review Service에서 처리합니다.
      
      // 업로드 시뮬레이션 (UI 테스트용)
      const simulateUpload = () => {
        return new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            
            if (progress >= 100) {
              clearInterval(interval);
              resolve();
            }
            
            // 진행률 업데이트
            setFiles(prev => prev.map(f => 
              f.id === fileId 
                ? { 
                    ...f, 
                    uploadProgress: progress,
                    uploadSpeed: file.size / 10,
                    remainingTime: (100 - progress) / 10
                  }
                : f
            ));
          }, 100);
        });
      };

      await simulateUpload();

      // 업로드 완료 (실제로는 파일 객체만 준비됨)
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              isUploading: false,
              uploadProgress: 100,
              uploadedUrl: URL.createObjectURL(file.file), // 임시 URL
              error: undefined
            }
          : f
      ));

    } catch (error) {
      console.error(`Upload failed for file ${file.filename}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : '업로드에 실패했습니다.';
      
      // 에러 상태로 업데이트
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              isUploading: false,
              error: errorMessage
            }
          : f
      ));
    } finally {
      activeUploadsRef.current.delete(fileId);
    }
  }, [files]);

  /**
   * 파일 추가
   */
  const addFiles = useCallback(async (newFiles: File[]) => {
    const validFiles: UploadFile[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const uploadFile: UploadFile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          file,
          url: detectFileType(file) === 'image' ? URL.createObjectURL(file) : undefined,
          filename: file.name,
          size: file.size,
          type: detectFileType(file),
          mimeType: file.type,
          isUploading: false,
          uploadProgress: 0
        };
        validFiles.push(uploadFile);
      }
    }

    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
      // 에러 처리는 상위 컴포넌트에서 처리하도록 에러를 throw하거나 콜백으로 전달
    }

    if (validFiles.length === 0) return;

    // 파일 목록에 추가
    setFiles(prev => [...prev, ...validFiles]);

    // 자동 업로드가 활성화된 경우 업로드 시작
    if (autoUpload) {
      // startUpload를 직접 호출하지 않고 별도 함수로 처리
      setIsUploading(true);
      uploadStartTimeRef.current = Date.now();
      
      const uploadPromises = validFiles.map(f => uploadSingleFile(f.id));
      await Promise.allSettled(uploadPromises);
      
      setIsUploading(false);
    }
  }, [validateFile, autoUpload, uploadSingleFile]);

  /**
   * 업로드 시작 (배치 또는 개별)
   */
  const startUpload = useCallback(async (fileIds?: string[]) => {
    const targetFiles = fileIds 
      ? files.filter(f => fileIds.includes(f.id))
      : files.filter(f => !f.isUploading && !f.uploadedUrl && !f.error);

    if (targetFiles.length === 0) return;

    setIsUploading(true);
    uploadStartTimeRef.current = Date.now();

    if (concurrent) {
      // 동시 업로드 (제한된 개수)
      const chunks: string[][] = [];
      for (let i = 0; i < targetFiles.length; i += maxConcurrent) {
        chunks.push(targetFiles.slice(i, i + maxConcurrent).map(f => f.id));
      }

      for (const chunk of chunks) {
        await Promise.allSettled(chunk.map(id => uploadSingleFile(id)));
      }
    } else {
      // 순차 업로드
      for (const file of targetFiles) {
        await uploadSingleFile(file.id);
      }
    }

    setIsUploading(false);
  }, [files, concurrent, maxConcurrent, uploadSingleFile]);

  /**
   * 파일 제거
   */
  const removeFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }

    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, [files]);

  /**
   * 업로드 재시도
   */
  const retryUpload = useCallback(async (fileId: string) => {
    await uploadSingleFile(fileId);
  }, [uploadSingleFile]);

  /**
   * 모든 업로드 취소
   */
  const cancelAllUploads = useCallback(() => {
    // 실제 업로드 취소는 구현이 복잡하므로, 여기서는 상태만 초기화
    setFiles(prev => prev.map(f => 
      f.isUploading 
        ? { ...f, isUploading: false, error: '업로드가 취소되었습니다.' }
        : f
    ));
    setIsUploading(false);
    activeUploadsRef.current.clear();
  }, []);

  /**
   * 모든 파일 제거
   */
  const clearAllFiles = useCallback(() => {
    // Blob URL 정리
    files.forEach(file => {
      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });

    setFiles([]);
    setIsUploading(false);
    activeUploadsRef.current.clear();
  }, [files]);

  // 통계 업데이트
  React.useEffect(() => {
    updateStatistics();
  }, [updateStatistics]);

  // 컴포넌트 언마운트 시 정리
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [files]);

  return {
    // 상태
    files,
    isUploading,
    statistics,
    
    // 액션
    addFiles,
    removeFile,
    startUpload,
    retryUpload,
    cancelAllUploads,
    clearAllFiles,
    
    // 유틸리티
    validateFile,
    
    // 계산된 값
    canAddMore: files.length < maxFiles,
    hasUploading: files.some(f => f.isUploading),
    hasPending: files.some(f => !f.isUploading && !f.uploadedUrl && !f.error),
    hasErrors: files.some(f => f.error),
    hasCompleted: files.some(f => f.uploadedUrl),
    completedFiles: files.filter(f => f.uploadedUrl),
    failedFiles: files.filter(f => f.error),
    pendingFiles: files.filter(f => !f.isUploading && !f.uploadedUrl && !f.error)
  };
};