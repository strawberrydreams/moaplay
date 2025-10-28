/**
 * 리뷰 모달 컴포넌트
 *
 * 리뷰 작성, 수정, 상세 보기를 위한 모달 컴포넌트입니다.
 * 이미지 업로드, 평점 선택, 폼 검증 등의 기능을 포함합니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  ReviewListItem,
  ReviewCreateRequest,
  ReviewUpdateRequest,
} from '../../types/reviews';
import { ReviewService } from '../../services/reviewService';
import { UploadService } from '../../services/uploadService';
import { getImageUrl, handleImageError } from '../../utils/image';
import { useAuth } from '../../hooks';
import { useReviewContext } from '../../contexts/ReviewContext';
import { ImageModal } from '../common/ImageModal';

/**
 * 리뷰 모달 모드
 */
type ReviewModalMode = 'create' | 'edit' | 'view';

/**
 * 리뷰 모달 Props
 */
interface ReviewModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 모달 모드 */
  mode: ReviewModalMode;
  /** 행사 ID (작성 모드에서 필요) */
  eventId?: number;
  /** 수정할 리뷰 (수정/보기 모드에서 필요) */
  review?: ReviewListItem;
  /** 리뷰 저장 완료 핸들러 */
  onSave?: (review: ReviewListItem) => void;
  /** 리뷰 삭제 완료 핸들러 */
  onDelete?: (reviewId: number) => void;
}

/**
 * 리뷰 폼 데이터
 */
interface ReviewFormData {
  title: string;
  content: string;
  rating: number;
  imageFiles: File[];
  imageUrls: string[];
}

/**
 * 리뷰 모달 컴포넌트
 */
export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  mode,
  eventId,
  review,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    rating: 5,
    imageFiles: [],
    imageUrls: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { user, isAuthenticated } = useAuth();
  const { notifyReviewCreated, notifyReviewUpdated, notifyReviewDeleted } =
    useReviewContext();

  // 모달이 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      if ((mode === 'edit' || mode === 'view') && review) {
        setFormData({
          title: review.title,
          content: review.content,
          rating: review.rating,
          imageFiles: [],
          imageUrls: review.image_urls || [],
        });
        // 기존 이미지 URL을 전체 URL로 변환하여 미리보기에 표시
        setImagePreviewUrls(
          (review.image_urls || []).map(url => getImageUrl(url))
        );
      } else if (mode === 'create') {
        setFormData({
          title: '',
          content: '',
          rating: 5,
          imageFiles: [],
          imageUrls: [],
        });
        setImagePreviewUrls([]);
      }
      setErrors({});
    }
  }, [isOpen, mode, review]);

  /**
   * 모달 외부 클릭 시 닫기
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * 폼 필드 변경 처리
   */
  const handleFieldChange = (
    field: keyof ReviewFormData,
    value: string | number | File[]
  ) => {
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
   * 이미지 파일 선택 처리
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 5;
    const currentImageCount =
      formData.imageUrls.length + formData.imageFiles.length;

    if (currentImageCount + files.length > maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    // 이미지 미리보기 URL 생성
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...files],
    }));

    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  /**
   * 이미지 제거 처리
   */
  const handleImageRemove = (index: number, isExisting: boolean) => {
    if (isExisting) {
      // 기존 이미지 제거
      setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      }));
    } else {
      // 새로 추가된 이미지 제거
      const fileIndex = index - formData.imageUrls.length;
      setFormData(prev => ({
        ...prev,
        imageFiles: prev.imageFiles.filter((_, i) => i !== fileIndex),
      }));

      // 미리보기 URL 정리
      URL.revokeObjectURL(imagePreviewUrls[index]);
      setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  /**
   * 폼 검증
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '리뷰 제목을 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '리뷰 내용을 입력해주세요.';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = '리뷰 내용은 최소 10자 이상 입력해주세요.';
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = '평점을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 리뷰 저장 처리
   */
  const handleSave = async () => {
    if (!validateForm()) return;
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 이미지 업로드 처리
      let uploadedImageUrls: string[] = [];
      if (formData.imageFiles.length > 0) {
        try {
          const uploadResult = await UploadService.uploadMultipleImages(
            formData.imageFiles
          );
          uploadedImageUrls = uploadResult.urls;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          alert('이미지 업로드에 실패했습니다. 이미지 없이 저장하시겠습니까?');
          // 사용자가 취소하면 저장 중단
          if (!window.confirm('이미지 없이 저장하시겠습니까?')) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      // 기존 이미지 URL + 새로 업로드된 이미지 URL
      const allImageUrls = [...formData.imageUrls, ...uploadedImageUrls];

      let savedReview: ReviewListItem;

      if (mode === 'create' && eventId) {
        const createData: ReviewCreateRequest = {
          event_id: eventId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          rating: formData.rating,
          image_urls: allImageUrls,
        };
        savedReview = await ReviewService.createReview(createData);

        // 전역 상태에 리뷰 생성 알림
        notifyReviewCreated(eventId, savedReview);

        // 리뷰 작성 성공 시 즉시 콜백 호출하여 목록 갱신
        if (onSave) {
          onSave(savedReview);
        }
      } else if (mode === 'edit' && review) {
        const updateData: ReviewUpdateRequest = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          rating: formData.rating,
          image_urls: allImageUrls,
        };
        savedReview = await ReviewService.updateReview(review.id, updateData);

        // 전역 상태에 리뷰 수정 알림
        notifyReviewUpdated(review.event.id, savedReview);

        // 리뷰 수정 성공 시 즉시 콜백 호출하여 목록 갱신
        if (onSave) {
          onSave(savedReview);
        }
      } else {
        throw new Error('Invalid mode or missing data');
      }

      // 모달 닫기
      onClose();
    } catch (error) {
      console.error('Failed to save review:', error);
      alert('리뷰 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 리뷰 삭제 처리
   */
  const handleDelete = async () => {
    if (!review || !window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await ReviewService.deleteReview(review.id);

      // 전역 상태에 리뷰 삭제 알림
      notifyReviewDeleted(review.event.id, review.id);

      if (onDelete) {
        onDelete(review.id);
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('리뷰 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
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
          onClick={() => mode !== 'view' && handleRatingChange(i)}
          disabled={mode === 'view'}
        >
          ★
        </RatingStar>
      );
    }
    return stars;
  };

  /**
   * 사용자 프로필로 이동
   */
  const handleUserProfileClick = () => {
    if (review) {
      window.location.href = `/users/${review.user.id}/profile`;
    }
  };

  /**
   * 이미지 클릭 처리 (원본 이미지 모달 열기)
   */
  const handleImageClick = (index: number) => {
    if (isViewMode) {
      setSelectedImageIndex(index);
      setShowImageModal(true);
    }
  };

  /**
   * 수정 모드로 전환
   */
  const handleSwitchToEdit = () => {
    if (!review) return;

    // 현재 리뷰 데이터로 폼 초기화
    setFormData({
      title: review.title,
      content: review.content,
      rating: review.rating,
      imageFiles: [],
      imageUrls: review.image_urls || [],
    });
    setImagePreviewUrls((review.image_urls || []).map(url => getImageUrl(url)));

    // 모달을 닫지 않고 모드만 변경
    // 부모 컴포넌트에 모드 변경 알림을 위해 커스텀 이벤트 발생
    const editEvent = new CustomEvent('reviewModalModeChange', {
      detail: { mode: 'edit', review },
    });
    window.dispatchEvent(editEvent);
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';
  const canEdit = review && review.user.id === user?.id;
  const canDelete =
    review && (review.user.id === user?.id || user?.role === 'admin');

  return (
    <ModalOverlay onClick={handleBackdropClick}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          {/* 리뷰 작성자 정보 (view 모드에서만 표시) */}
          {isViewMode && review && (
            <ReviewAuthorInfo onClick={handleUserProfileClick}>
              <AuthorAvatar
                src={review.user.profile_image || '/default-avatar.png'}
                alt={review.user.nickname}
                onError={e => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <AuthorName>{review.user.nickname}</AuthorName>
            </ReviewAuthorInfo>
          )}

          <ModalTitle>
            {isCreateMode && '리뷰 작성'}
            {isEditMode && '리뷰 수정'}
            {isViewMode && '리뷰 상세'}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalContent>
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
            <Label>제목</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={e => handleFieldChange('title', e.target.value)}
              placeholder="리뷰 제목을 입력하세요"
              disabled={isViewMode}
              maxLength={100}
            />
            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
          </FormGroup>

          {/* 내용 */}
          <FormGroup>
            <Label>내용</Label>
            <Textarea
              value={formData.content}
              onChange={e => handleFieldChange('content', e.target.value)}
              placeholder="리뷰 내용을 입력하세요 (최소 10자)"
              disabled={isViewMode}
              rows={6}
              maxLength={1000}
            />
            <CharacterCount>{formData.content.length}/1000</CharacterCount>
            {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
          </FormGroup>

          {/* 이미지 */}
          <FormGroup>
            <Label>이미지 (선택사항)</Label>
            {!isViewMode && (
              <ImageUploadButton>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">📷 이미지 추가 (최대 5개)</label>
              </ImageUploadButton>
            )}

            {imagePreviewUrls.length > 0 && (
              <ImagePreviewGrid>
                {imagePreviewUrls.map((url, index) => {
                  const isExisting = index < formData.imageUrls.length;
                  return (
                    <ImagePreviewItem
                      key={`${isExisting ? 'existing' : 'new'}-${index}`}
                    >
                      <PreviewImage
                        src={url}
                        alt={`리뷰 이미지 ${index + 1}`}
                        onClick={() => handleImageClick(index)}
                        clickable={isViewMode}
                        onError={e =>
                          handleImageError(e, '/placeholder-image.jpg')
                        }
                      />
                      {!isViewMode && (
                        <RemoveImageButton
                          onClick={() => handleImageRemove(index, isExisting)}
                        >
                          ×
                        </RemoveImageButton>
                      )}
                    </ImagePreviewItem>
                  );
                })}
              </ImagePreviewGrid>
            )}
          </FormGroup>
        </ModalContent>

        <ModalFooter>
          {isViewMode ? (
            <>
              {canEdit && (
                <EditButtonFooter
                  onClick={handleSwitchToEdit}
                  disabled={isSubmitting}
                >
                  수정하기
                </EditButtonFooter>
              )}
              {canDelete && (
                <DeleteButton onClick={handleDelete} disabled={isSubmitting}>
                  삭제하기
                </DeleteButton>
              )}
              <CancelButton onClick={onClose}>닫기</CancelButton>
            </>
          ) : (
            <>
              <CancelButton onClick={onClose} disabled={isSubmitting}>
                취소
              </CancelButton>
              <SaveButton onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : '저장'}
              </SaveButton>
            </>
          )}
        </ModalFooter>
      </ModalContainer>

      {/* 이미지 원본 보기 모달 */}
      {showImageModal && (
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          images={formData.imageUrls}
          currentIndex={selectedImageIndex}
          onIndexChange={setSelectedImageIndex}
          alt="리뷰 이미지"
        />
      )}
    </ModalOverlay>
  );
};

// 스타일 컴포넌트들
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  gap: 16px;
`;

const ReviewAuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const AuthorAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background: #f8f9fa;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
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
  width: 100%;
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
  margin-top: 4px;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RatingStar = styled.span<{ filled: boolean; disabled: boolean }>`
  font-size: 24px;
  color: ${props => (props.filled ? '#ffc107' : '#e9ecef')};
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  transition: color 0.2s ease;

  &:hover {
    ${props => !props.disabled && `color: #ffc107;`}
  }
`;

const RatingText = styled.span`
  font-size: 14px;
  color: #6c757d;
`;

const ImageUploadButton = styled.div`
  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #6c757d;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
      border-color: #007bff;
      color: #007bff;
    }
  }
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  aspect-ratio: 1;
`;

const PreviewImage = styled.img<{ clickable?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: transform 0.2s ease;

  ${({ clickable }) =>
    clickable &&
    `
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #c82333;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
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

const SaveButton = styled(Button)`
  background: #007bff;
  color: white;

  &:hover:not(:disabled) {
    background: #0056b3;
  }
`;

const DeleteButton = styled(Button)`
  background: #dc3545;
  color: white;

  &:hover:not(:disabled) {
    background: #c82333;
  }
`;

const EditButtonFooter = styled(Button)`
  background: #28a745;
  color: white;
  margin-right: auto;

  &:hover:not(:disabled) {
    background: #218838;
  }
`;

export default ReviewModal;
