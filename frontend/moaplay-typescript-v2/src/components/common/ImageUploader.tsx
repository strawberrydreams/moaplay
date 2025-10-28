/**
 * 이미지 업로더 컴포넌트
 * 
 * 드래그 앤 드롭과 파일 선택을 지원하는 이미지 업로드 컴포넌트입니다.
 * 미리보기, 진행률 표시, 파일 검증 기능을 포함합니다.
 * 
 * 주요 기능:
 * - 드래그 앤 드롭 파일 업로드
 * - 다중 파일 선택 및 업로드
 * - 실시간 업로드 진행률 표시
 * - 이미지 미리보기 및 관리
 * - 파일 검증 (형식, 크기)
 * - 업로드 에러 처리 및 재시도
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { UploadService } from '../../services/uploadService';
/**
 * 업로드된 이미지 정보
 */
export interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  filename: string;
  size: number;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  uploadSpeed?: number; // 업로드 속도 (bytes/sec)
  remainingTime?: number; // 남은 시간 (초)
}

/**
 * 업로드 통계 정보
 */
export interface UploadStats {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  totalSize: number;
  uploadedSize: number;
  overallProgress: number;
}

/**
 * 이미지 업로더 Props
 */
interface ImageUploaderProps {
  /** 현재 이미지 목록 */
  images: UploadedImage[];
  /** 이미지 변경 핸들러 */
  onImagesChange: (images: UploadedImage[]) => void;
  /** 최대 이미지 개수 */
  maxImages?: number;
  /** 최대 파일 크기 (바이트) */
  maxFileSize?: number;
  /** 허용된 파일 형식 */
  acceptedTypes?: string[];
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
  /** 업로드 완료 콜백 */
  onUploadComplete?: (images: UploadedImage[]) => void;
  /** 업로드 에러 콜백 */
  onUploadError?: (error: string, file: File) => void;
  /** 업로드 진행률 콜백 */
  onUploadProgress?: (stats: UploadStats) => void;
  /** 컴팩트 모드 (작은 크기로 표시) */
  compact?: boolean;
  /** 즉시 업로드 여부 (false면 파일만 선택하고 수동 업로드) */
  autoUpload?: boolean;
}

/**
 * 이미지 업로더 컴포넌트
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 16 * 1024 * 1024, // 16MB (백엔드 제한에 맞춤)
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  disabled = false,
  className,
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  compact = false,
  autoUpload = true
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    totalFiles: 0,
    completedFiles: 0,
    failedFiles: 0,
    totalSize: 0,
    uploadedSize: 0,
    overallProgress: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadStartTimeRef = useRef<number>(0);

  /**
   * 파일 검증
   */
  const validateFile = useCallback((file: File): string | null => {
    // 파일 형식 검증
    if (!acceptedTypes.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${acceptedTypes.join(', ')})`;
    }

    // 파일 크기 검증
    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024);
      return `파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`;
    }

    return null;
  }, [acceptedTypes, maxFileSize]);

  /**
   * 업로드 통계 업데이트
   */
  const updateUploadStats = useCallback(() => {
    const totalFiles = images.length;
    const completedFiles = images.filter(img => !img.isUploading && !img.error).length;
    const failedFiles = images.filter(img => img.error).length;
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const uploadedSize = images.reduce((sum, img) => {
      if (img.isUploading && img.uploadProgress) {
        return sum + (img.size * img.uploadProgress / 100);
      } else if (!img.isUploading && !img.error) {
        return sum + img.size;
      }
      return sum;
    }, 0);
    const overallProgress = totalSize > 0 ? Math.round((uploadedSize / totalSize) * 100) : 0;

    const stats: UploadStats = {
      totalFiles,
      completedFiles,
      failedFiles,
      totalSize,
      uploadedSize,
      overallProgress
    };

    setUploadStats(stats);
    onUploadProgress?.(stats);
  }, [images, onUploadProgress]);

  /**
   * 업로드 속도 및 남은 시간 계산
   */
  const calculateUploadMetrics = (uploadedBytes: number, startTime: number) => {
    const elapsedTime = (Date.now() - startTime) / 1000; // 초
    const uploadSpeed = elapsedTime > 0 ? uploadedBytes / elapsedTime : 0;
    return { uploadSpeed };
  };

  /**
   * 파일 업로드 처리
   */
  const uploadFile = useCallback(async (file: File): Promise<UploadedImage> => {
    const imageId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const startTime = Date.now();
    
    // 임시 이미지 객체 생성 (업로드 중 상태)
    const tempImage: UploadedImage = {
      id: imageId,
      file,
      url: URL.createObjectURL(file),
      filename: file.name,
      size: file.size,
      isUploading: true,
      uploadProgress: 0,
      uploadSpeed: 0,
      remainingTime: 0
    };

    // 이미지 목록에 추가 (업로드 중 상태로)
    const updatedImages = [...images, tempImage];
    onImagesChange(updatedImages);

    try {
      // 실제 업로드 수행
      const response = await UploadService.uploadImageWithProgress(
        file,
        (progress) => {
          // 업로드 메트릭 계산
          const uploadedBytes = (file.size * progress) / 100;
          const { uploadSpeed } = calculateUploadMetrics(uploadedBytes, startTime);
          const remainingBytes = file.size - uploadedBytes;
          const remainingTime = uploadSpeed > 0 ? Math.ceil(remainingBytes / uploadSpeed) : 0;

          // 진행률 업데이트
          const progressImages = updatedImages.map(img => 
            img.id === imageId 
              ? { 
                  ...img, 
                  uploadProgress: progress,
                  uploadSpeed,
                  remainingTime
                }
              : img
          );
          onImagesChange(progressImages);
        }
      );

      // 업로드 완료 후 이미지 정보 업데이트
      const uploadedImage: UploadedImage = {
        id: imageId,
        url: response.url,
        filename: file.name,
        size: file.size,
        isUploading: false
      };

      // 임시 URL 정리
      URL.revokeObjectURL(tempImage.url);

      // 완료된 이미지로 교체
      const finalImages = updatedImages.map(img => 
        img.id === imageId ? uploadedImage : img
      );
      onImagesChange(finalImages);

      return uploadedImage;

    } catch (error) {
      console.error('Image upload failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : '업로드에 실패했습니다.';
      
      // 에러 상태로 업데이트
      const errorImages = updatedImages.map(img => 
        img.id === imageId 
          ? { ...img, isUploading: false, error: errorMessage }
          : img
      );
      onImagesChange(errorImages);

      // 에러 콜백 호출
      onUploadError?.(errorMessage, file);

      throw error;
    }
  }, [images, onImagesChange, onUploadError]);

  /**
   * 배치 업로드 처리 (여러 파일 동시 업로드)
   */
  const uploadBatch = useCallback(async (files: File[]) => {
    if (!autoUpload) return;

    uploadStartTimeRef.current = Date.now();
    
    // 모든 파일을 동시에 업로드 시작
    const uploadPromises = files.map(file => uploadFile(file));
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      
      // 성공한 업로드들
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<UploadedImage> => 
          result.status === 'fulfilled')
        .map(result => result.value);
      
      // 실패한 업로드들
      const failedUploads = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected');
      
      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
      }
      
      if (failedUploads.length > 0) {
        console.error(`${failedUploads.length}개 파일 업로드 실패`);
      }
      
    } catch (error) {
      console.error('Batch upload failed:', error);
    }
  }, [autoUpload, uploadFile, onUploadComplete]);

  /**
   * 파일 선택 처리
   */
  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 검증
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        // 중복 파일 검사
        const isDuplicate = images.some(img => 
          img.filename === file.name && img.size === file.size
        );
        
        if (isDuplicate) {
          errors.push(`${file.name}: 이미 추가된 파일입니다.`);
        } else {
          validFiles.push(file);
        }
      }
    }

    // 검증 에러가 있으면 알림
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // 자동 업로드가 활성화된 경우 배치 업로드 실행
    if (autoUpload) {
      await uploadBatch(validFiles);
    } else {
      // 수동 업로드 모드: 파일만 목록에 추가
      const newImages: UploadedImage[] = validFiles.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        file,
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        isUploading: false,
        uploadProgress: 0
      }));
      
      onImagesChange([...images, ...newImages]);
    }
  }, [disabled, images, maxImages, autoUpload, uploadBatch, onImagesChange, validateFile]);

  /**
   * 파일 입력 변경 처리
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // 입력 값 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = '';
  };

  /**
   * 드래그 오버 처리
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  /**
   * 드래그 리브 처리
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  /**
   * 드롭 처리
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  /**
   * 이미지 제거 처리
   */
  const handleImageRemove = (imageId: string) => {
    if (disabled) return;

    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.file) {
      // 임시 URL 정리
      URL.revokeObjectURL(imageToRemove.url);
    }

    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  /**
   * 파일 선택 버튼 클릭
   */
  const handleSelectClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * 업로드 재시도
   */
  const handleRetryUpload = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.file || image.isUploading) return;

    try {
      await uploadFile(image.file);
    } catch (error) {
      console.error('Retry upload failed:', error);
    }
  };

  /**
   * 수동 업로드 시작 (모든 대기 중인 파일)
   */
  const handleStartUpload = async () => {
    const pendingFiles = images.filter(img => img.file && !img.isUploading && !img.error);
    if (pendingFiles.length === 0) return;

    await uploadBatch(pendingFiles.map(img => img.file!));
  };

  /**
   * 모든 업로드 취소
   */
  const handleCancelAllUploads = () => {
    const nonUploadingImages = images.filter(img => !img.isUploading);
    onImagesChange(nonUploadingImages);
  };

  // 업로드 통계 업데이트
  useEffect(() => {
    updateUploadStats();
  }, [updateUploadStats]);

  // 메모리 누수 방지: 컴포넌트 언마운트 시 Blob URL 정리
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.file && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  const canAddMore = images.length < maxImages && !disabled;
  const hasUploading = images.some(img => img.isUploading);
  const hasPending = images.some(img => img.file && !img.isUploading && !img.error);
  const hasErrors = images.some(img => img.error);

  return (
    <UploaderContainer className={className} compact={compact}>
      {/* 전체 업로드 진행률 */}
      {(hasUploading || uploadStats.totalFiles > 0) && (
        <OverallProgressSection>
          <OverallProgressHeader>
            <ProgressTitle>
              업로드 진행률: {uploadStats.completedFiles}/{uploadStats.totalFiles}
            </ProgressTitle>
            <ProgressPercentage>{uploadStats.overallProgress}%</ProgressPercentage>
          </OverallProgressHeader>
          
          <OverallProgressBar>
            <OverallProgressFill progress={uploadStats.overallProgress} />
          </OverallProgressBar>
          
          <ProgressDetails>
            <ProgressDetail>
              완료: {uploadStats.completedFiles}개
            </ProgressDetail>
            {uploadStats.failedFiles > 0 && (
              <ProgressDetail error>
                실패: {uploadStats.failedFiles}개
              </ProgressDetail>
            )}
            <ProgressDetail>
              크기: {UploadService.formatFileSize(uploadStats.uploadedSize)} / {UploadService.formatFileSize(uploadStats.totalSize)}
            </ProgressDetail>
          </ProgressDetails>
        </OverallProgressSection>
      )}

      {/* 드래그 앤 드롭 영역 */}
      {canAddMore && (
        <DropZone
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleSelectClick}
          compact={compact}
        >
          <DropZoneContent>
            <UploadIcon compact={compact}>📷</UploadIcon>
            <DropZoneText compact={compact}>
              {compact ? '이미지 추가' : '이미지를 드래그하거나 클릭하여 업로드'}
            </DropZoneText>
            {!compact && (
              <DropZoneSubText>
                최대 {maxImages}개, {UploadService.formatFileSize(maxFileSize)} 이하
                <br />
                지원 형식: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              </DropZoneSubText>
            )}
          </DropZoneContent>
        </DropZone>
      )}

      {/* 숨겨진 파일 입력 */}
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* 배치 업로드 컨트롤 */}
      {!autoUpload && images.length > 0 && (
        <BatchControls>
          {hasPending && (
            <BatchButton onClick={handleStartUpload} disabled={disabled}>
              모든 파일 업로드 시작
            </BatchButton>
          )}
          {hasUploading && (
            <BatchButton onClick={handleCancelAllUploads} variant="danger" disabled={disabled}>
              업로드 취소
            </BatchButton>
          )}
          {hasErrors && (
            <BatchButton 
              onClick={() => {
                const errorImages = images.filter(img => img.error);
                errorImages.forEach(img => handleRetryUpload(img.id));
              }}
              variant="warning"
              disabled={disabled}
            >
              실패한 파일 재시도
            </BatchButton>
          )}
        </BatchControls>
      )}

      {/* 이미지 미리보기 그리드 */}
      {images.length > 0 && (
        <ImageGrid compact={compact}>
          {images.map((image) => (
            <ImagePreviewItem key={image.id} compact={compact}>
              <ImagePreview compact={compact}>
                <PreviewImage 
                  src={image.url} 
                  alt={image.filename}
                  loading="lazy"
                />
                
                {/* 업로드 진행률 */}
                {image.isUploading && (
                  <UploadOverlay>
                    <ProgressBar>
                      <ProgressFill progress={image.uploadProgress || 0} />
                    </ProgressBar>
                    <ProgressText>{image.uploadProgress || 0}%</ProgressText>
                    
                    {/* 업로드 속도 및 남은 시간 */}
                    {image.uploadSpeed && image.uploadSpeed > 0 && (
                      <UploadMetrics>
                        <MetricText>
                          {UploadService.formatFileSize(image.uploadSpeed)}/s
                        </MetricText>
                        {image.remainingTime && image.remainingTime > 0 && (
                          <MetricText>
                            {image.remainingTime}초 남음
                          </MetricText>
                        )}
                      </UploadMetrics>
                    )}
                    
                    {/* 업로드 중 스피너 */}
                    <UploadSpinner />
                  </UploadOverlay>
                )}

                {/* 에러 상태 */}
                {image.error && (
                  <ErrorOverlay>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>{image.error}</ErrorText>
                    <RetryButton onClick={() => handleRetryUpload(image.id)}>
                      재시도
                    </RetryButton>
                  </ErrorOverlay>
                )}

                {/* 성공 상태 */}
                {!image.isUploading && !image.error && !image.file && (
                  <SuccessOverlay>
                    <SuccessIcon>✅</SuccessIcon>
                  </SuccessOverlay>
                )}

                {/* 제거 버튼 */}
                {!image.isUploading && (
                  <RemoveButton
                    onClick={() => handleImageRemove(image.id)}
                    disabled={disabled}
                    compact={compact}
                  >
                    ×
                  </RemoveButton>
                )}
              </ImagePreview>
              
              <ImageInfo compact={compact}>
                <ImageName title={image.filename} compact={compact}>
                  {image.filename}
                </ImageName>
                <ImageSize compact={compact}>
                  {UploadService.formatFileSize(image.size)}
                </ImageSize>
                {image.isUploading && image.uploadSpeed && (
                  <UploadSpeed compact={compact}>
                    {UploadService.formatFileSize(image.uploadSpeed)}/s
                  </UploadSpeed>
                )}
              </ImageInfo>
            </ImagePreviewItem>
          ))}
        </ImageGrid>
      )}

      {/* 이미지 개수 및 상태 표시 */}
      {images.length > 0 && (
        <StatusBar>
          <ImageCount>
            {images.length} / {maxImages}
          </ImageCount>
          {hasUploading && (
            <StatusIndicator>
              <UploadingIcon />
              업로드 중...
            </StatusIndicator>
          )}
          {hasErrors && (
            <StatusIndicator error>
              {uploadStats.failedFiles}개 실패
            </StatusIndicator>
          )}
        </StatusBar>
      )}
    </UploaderContainer>
  );
};

// 애니메이션 정의
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// 스타일 컴포넌트들
const UploaderContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.compact ? '12px' : '16px'};
  animation: ${fadeIn} 0.3s ease-out;
`;

// 전체 진행률 섹션
const OverallProgressSection = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  animation: ${fadeIn} 0.3s ease-out;
`;

const OverallProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #495057;
`;

const ProgressPercentage = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #007bff;
`;

const OverallProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const OverallProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'progress'
})<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const ProgressDetails = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
`;

const ProgressDetail = styled.div<{ error?: boolean }>`
  color: ${props => props.error ? '#dc3545' : '#6c757d'};
  font-weight: ${props => props.error ? '600' : '400'};
`;

// 배치 컨트롤
const BatchControls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const BatchButton = styled.button<{ variant?: 'danger' | 'warning' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => {
    switch (props.variant) {
      case 'danger': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#007bff';
    }
  }};
  
  color: ${props => props.variant === 'warning' ? '#212529' : 'white'};

  &:hover:not(:disabled) {
    background: ${props => {
      switch (props.variant) {
        case 'danger': return '#c82333';
        case 'warning': return '#e0a800';
        default: return '#0056b3';
      }
    }};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DropZone = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragOver', 'compact'].includes(prop)
})<{ isDragOver: boolean; compact?: boolean }>`
  border: 2px dashed ${props => props.isDragOver ? '#007bff' : '#dee2e6'};
  border-radius: ${props => props.compact ? '8px' : '12px'};
  padding: ${props => props.compact ? '20px 16px' : '40px 20px'};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isDragOver ? '#f8f9ff' : '#fafafa'};
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #007bff;
    background: #f8f9ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const UploadIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  font-size: ${props => props.compact ? '32px' : '48px'};
  opacity: 0.6;
  transition: transform 0.2s ease;
  
  ${DropZone}:hover & {
    transform: scale(1.1);
  }
`;

const DropZoneText = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  font-size: ${props => props.compact ? '14px' : '16px'};
  font-weight: 500;
  color: #495057;
  margin: ${props => props.compact ? '4px 0' : '8px 0'};
`;

const DropZoneSubText = styled.div`
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
  margin-top: 4px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImageGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${props => props.compact ? '100px' : '120px'}, 1fr));
  gap: ${props => props.compact ? '12px' : '16px'};
  animation: ${fadeIn} 0.3s ease-out;
`;

const ImagePreviewItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.compact ? '6px' : '8px'};
  animation: ${fadeIn} 0.3s ease-out;
`;

const ImagePreview = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.compact ? '6px' : '8px'};
  overflow: hidden;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #007bff;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  backdrop-filter: blur(2px);
`;

const ProgressBar = styled.div`
  width: 80%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const ProgressFill = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'progress'
})<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
  border-radius: 3px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: ${pulse} 2s infinite;
  }
`;

const ProgressText = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const UploadMetrics = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
`;

const MetricText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 10px;
  font-weight: 500;
`;

const UploadSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-top: 8px;
`;

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(220, 53, 69, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  backdrop-filter: blur(2px);
`;

const ErrorIcon = styled.div`
  font-size: 20px;
  animation: ${pulse} 2s infinite;
`;

const ErrorText = styled.div`
  color: white;
  font-size: 11px;
  text-align: center;
  line-height: 1.3;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const RetryButton = styled.button`
  background: white;
  color: #dc3545;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const SuccessOverlay = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(40, 167, 69, 0.9);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SuccessIcon = styled.div`
  font-size: 12px;
  color: white;
`;

const RemoveButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  position: absolute;
  top: ${props => props.compact ? '-6px' : '-8px'};
  right: ${props => props.compact ? '-6px' : '-8px'};
  width: ${props => props.compact ? '20px' : '24px'};
  height: ${props => props.compact ? '20px' : '24px'};
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: 2px solid white;
  cursor: pointer;
  font-size: ${props => props.compact ? '12px' : '16px'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  opacity: 0;
  transform: scale(0.8);

  ${ImagePreview}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover:not(:disabled) {
    background: #c82333;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: scale(0.8);
  }
`;

const ImageInfo = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.compact ? '1px' : '2px'};
`;

const ImageName = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  font-size: ${props => props.compact ? '11px' : '12px'};
  color: #495057;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const ImageSize = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  font-size: ${props => props.compact ? '10px' : '11px'};
  color: #6c757d;
`;

const UploadSpeed = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact'
})<{ compact?: boolean }>`
  font-size: ${props => props.compact ? '9px' : '10px'};
  color: #007bff;
  font-weight: 500;
`;

// 상태 바
const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #e9ecef;
`;

const ImageCount = styled.div`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
`;

const StatusIndicator = styled.div<{ error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.error ? '#dc3545' : '#007bff'};
  font-weight: 500;
`;

const UploadingIcon = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export default ImageUploader;