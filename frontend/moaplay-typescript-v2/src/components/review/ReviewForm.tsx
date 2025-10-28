/**
 * 리뷰 폼 컴포넌트
 * 
 * 리뷰 작성 및 수정을 위한 폼 컴포넌트입니다.
 * 모달과 독립적으로 사용할 수 있도록 설계되었습니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ReviewListItem, ReviewCreateRequest, ReviewUpdateRequest } from '../../types/reviews';
import ImageUploader, { UploadedImage } from '../common/ImageUploader';
import { validateReviewForm } from '../../utils/validation';

/**
 * 리뷰 폼 모드
 */
type ReviewFormMode = 'create' | 'edit';

/**
 * 리뷰 폼 Props
 */
interface ReviewFormProps {
  /** 폼 모드 */
  mode: ReviewFormMode;
  /** 행사 ID (작성 모드에서 필요) */
  eventId?: number;
  /** 수정할 리뷰 (수정 모드에서 필요) */
  review?: ReviewListItem;
  /** 폼 제출 핸들러 */
  onSubmit: (data: ReviewCreateRequest | ReviewUpdateRequest) => Promise<void>;
  /** 취소 핸들러 */
  onCancel?: () => void;
  /** 제출 중 상태 */
  isSubmitting?: boolean;
  /** 클래스명 */
  className?: string;
}

/**
 * 리뷰 폼 데이터
 */
interface ReviewFormData {
  title: string;
  content: string;
  rating: number;
  images: UploadedImage[];
}

/**
 * 리뷰 폼 컴포넌트
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({
  mode,
  eventId,
  review,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    rating: 5,
    images: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 데이터 초기화
  useEffect(() => {
    if (mode === 'edit' && review) {
      // 기존 이미지들을 UploadedImage 형태로 변환
      const existingImages: UploadedImage[] = (review.image_urls || []).map((url: string, index: number) => ({
        id: `existing-${index}`,
        url,
        filename: `image-${index + 1}${getFileExtensionFromUrl(url)}`,
        size: 0, // 기존 이미지는 크기 정보가 없음
        isUploading: false
      }));

      setFormData({
        title: review.title,
        content: review.content,
        rating: review.rating,
        images: existingImages
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        content: '',
        rating: 5,
        images: []
      });
    }
    setErrors({});
  }, [mode, review]);

  /**
   * URL에서 파일 확장자 추출
   */
  const getFileExtensionFromUrl = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      const lastDot = pathname.lastIndexOf('.');
      return lastDot !== -1 ? pathname.substring(lastDot) : '.jpg';
    } catch {
      return '.jpg';
    }
  };

  /**
   * 폼 필드 변경 처리
   */
  const handleFieldChange = (field: keyof ReviewFormData, value: string | number | UploadedImage[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * 평점 선택 처리
   */
  const handleRatingChange = (rating: number) => {
    handleFieldChange('rating', rating);
  };

  /**
   * 이미지 변경 처리
   */
  const handleImagesChange = (images: UploadedImage[]) => {
    handleFieldChange('images', images);
  };

  /**
   * 폼 검증
   */
  const validateForm = (): boolean => {
    const validation = validateReviewForm({
      title: formData.title,
      content: formData.content,
      rating: formData.rating
    });

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return false;
    }

    setErrors({});
    return true;
  };

  /**
   * 폼 제출 처리
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // 업로드된 이미지 URL들 추출
      const imageUrls = formData.images
        .filter(img => !img.isUploading && !img.error)
        .map(img => img.url);

      if (mode === 'create' && eventId) {
        const createData: ReviewCreateRequest = {
          event_id: eventId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          rating: formData.rating,
          image_urls: imageUrls
        };
        await onSubmit(createData);
      } else if (mode === 'edit') {
        const updateData: ReviewUpdateRequest = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          rating: formData.rating,
          image_urls: imageUrls
        };
        await onSubmit(updateData);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      // 에러는 부모 컴포넌트에서 처리
    }
  };

  /**
   * 평점 별 렌더링
   */
  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <RatingStar
          key={i}
          filled={i <= formData.rating}
          onClick={() => handleRatingChange(i)}
        >
          ★
        </RatingStar>
      );
    }
    return stars;
  };

  return (
    <FormContainer className={className} onSubmit={handleSubmit}>
      {/* 평점 */}
      <FormGroup>
        <Label>평점</Label>
        <RatingContainer>
          {renderRatingStars()}
          <RatingText>({formData.rating}/5)</RatingText>
        </RatingContainer>
        {errors.rating && <ErrorMessage>{errors.rating}</ErrorMessage>}
      </FormGroup>

      {/* 제목 */}
      <FormGroup>
        <Label htmlFor="review-title">제목</Label>
        <Input
          id="review-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="리뷰 제목을 입력하세요"
          disabled={isSubmitting}
          maxLength={100}
        />
        {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
      </FormGroup>

      {/* 내용 */}
      <FormGroup>
        <Label htmlFor="review-content">내용</Label>
        <Textarea
          id="review-content"
          value={formData.content}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          placeholder="리뷰 내용을 입력하세요 (최소 10자)"
          disabled={isSubmitting}
          rows={6}
          maxLength={1000}
        />
        <CharacterCount>
          {formData.content.length}/1000
        </CharacterCount>
        {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
      </FormGroup>

      {/* 이미지 */}
      <FormGroup>
        <Label>이미지 (선택사항)</Label>
        <ImageUploader
          images={formData.images}
          onImagesChange={handleImagesChange}
          maxImages={5}
          maxFileSize={5 * 1024 * 1024} // 5MB
          disabled={isSubmitting}
        />
      </FormGroup>

      {/* 버튼들 */}
      <ButtonGroup>
        {onCancel && (
          <CancelButton type="button" onClick={onCancel} disabled={isSubmitting}>
            취소
          </CancelButton>
        )}
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
};

// 스타일 컴포넌트들
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
  }
`;

const Textarea = styled.textarea`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 12px;
  color: #6c757d;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RatingStar = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'filled'
})<{ filled: boolean }>`
  font-size: 24px;
  color: ${props => props.filled ? '#ffc107' : '#e9ecef'};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #ffc107;
  }
`;

const RatingText = styled.span`
  font-size: 14px;
  color: #6c757d;
`;



const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

const SubmitButton = styled(Button)`
  background: #007bff;
  color: white;

  &:hover:not(:disabled) {
    background: #0056b3;
  }
`;

export default ReviewForm;