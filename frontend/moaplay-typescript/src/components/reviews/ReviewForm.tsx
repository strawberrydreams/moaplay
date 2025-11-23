import React, { useEffect, useState } from 'react';
import * as S from '../../styles/components/ReviewForm.styles';
import { FaPlus } from 'react-icons/fa';
import * as UploadApi from '../../services/uploadApi';
import * as ReviewApi from '../../services/reviewsApi';
import type * as R from '../../types/reviews';

interface ReviewFormProps {
    event_id: number;
    onClose: () => void;
    onReviewSubmitSuccess?: () => void;
    review?: R.Review; // ✅ 기존 리뷰 데이터 (수정용)
}

const ReviewForm: React.FC<ReviewFormProps> = ({
                                                   event_id,
                                                   onClose,
                                                   onReviewSubmitSuccess,
                                                   review
                                               }) => {
    const isEditMode = !!review;
    const [title, setTitle] = useState(review?.title || '');
    const [content, setContent] = useState(review?.content || '');
    const [rating, setRating] = useState(review?.rating || 0);
    const [image_urls, setImageUrls] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(review?.image_urls || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 수정 모드일 경우 기존 값으로 초기화
    useEffect(() => {
        if (review) {
            setTitle(review.title || '');
            setContent(review.content || '');
            setRating(review.rating || 0);
            setImagePreviews(review.image_urls || []);
        }
    }, [review]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        if (!file) return;
        if (image_urls.length + imagePreviews.length >= 3) {
            setError('이미지는 최대 3개까지 첨부 가능합니다.');
            return;
        }

        // 즉각 미리보기 추가
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);

        // 업로드 API 호출
        try {
            await UploadApi.uploadImage(file);
            setImageUrls(prev => [...prev, file]);
        } catch (uploadError) {
            console.error('이미지 업로드 실패:', uploadError);
            setError('이미지 업로드에 실패했습니다.');
        }

        // 입력값 초기화 (같은 파일 재선택 가능하도록)
        e.target.value = '';
    };

    const handleRemoveImage = (index: number) => {
        setImageUrls(image_urls.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError('제목을 입력해주세요.');
        if (!content.trim()) return setError('내용을 입력해주세요.');
        if (rating === 0) return setError('별점을 선택해주세요.');

        setIsSubmitting(true);

        try {
            const payload: R.CreateReviewPayload = {
                event_id,
                title,
                content,
                rating,
                image_urls: imagePreviews  // 업로드 완료된 URL 배열 사용
            };

            if (isEditMode && review) {
                // 수정 API 호출
                await ReviewApi.updateReview(review.id, payload);
                alert('리뷰가 수정되었습니다.');
                window.location.reload();
            } else {
                // 신규 작성 API 호출
                await ReviewApi.createReview(payload);
                alert('리뷰가 작성되었습니다.');
                window.location.reload();
            }

            onReviewSubmitSuccess?.();
            onClose();
        } catch (err) {
            console.error('리뷰 저장 실패:', err);
            setError('리뷰 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <S.FormContainer onSubmit={handleSubmit}>
            <S.InputGroup>
                <S.Label>제목</S.Label>
                <S.Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력해주세요"
                    disabled={isSubmitting}
                />
            </S.InputGroup>

            <S.InputGroup>
                <S.Label>내용</S.Label>
                <S.Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 입력해주세요"
                    disabled={isSubmitting}
                />
            </S.InputGroup>

            <S.RatingGroup>
                <S.Label>별점</S.Label>
                <S.StarsContainer>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <S.StarButton
                            key={star}
                            type="button"
                            value={rating}
                            $isActive={star <= rating}
                            onClick={() =>  setRating(star)}
                        >
                            ★
                        </S.StarButton>
                    ))}
                </S.StarsContainer>
            </S.RatingGroup>

            {/* 이미지 업로드 */}
            <S.ImageUploadGroup>
                <S.Label>사진 첨부 (최대 3개)</S.Label>
                <S.ImagePreviewContainer>
                    {imagePreviews.map((previewUrl, index) => (
                        <S.ImagePlaceholder key={index} onClick={() => handleRemoveImage(index)} title="클릭해서 삭제">
                            <img src={previewUrl} alt={`preview ${index}`} />
                        </S.ImagePlaceholder>
                    ))}
                    {imagePreviews.length < 3 && (
                        <S.ImagePlaceholder as="label" htmlFor="reviewImageUpload">
                            <FaPlus />
                            <input
                                id="reviewImageUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                disabled={isSubmitting}
                            />
                        </S.ImagePlaceholder>
                    )}
                </S.ImagePreviewContainer>
            </S.ImageUploadGroup>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <S.SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting
                    ? '저장 중...'
                    : isEditMode
                        ? '리뷰 수정'
                        : '리뷰 작성'}
            </S.SubmitButton>
        </S.FormContainer>
    );
};

export default ReviewForm;
