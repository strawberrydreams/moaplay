// src/components/ReviewForm.tsx (새 파일)
import React, { useState } from 'react';
import * as S from '../styles/ReviewForm.styles'; // 스타일 임포트
import { FaPlus, FaImage } from 'react-icons/fa'; // 아이콘 임포트
import * as ReviewApi from '../service/reviewsApi';
import * as R from '../types/reviews';

interface ReviewFormProps {
  event_id: number; // 어떤 이벤트에 대한 리뷰인지 ID 받기
  onClose: () => void; // 모달 닫기 함수
  onReviewSubmitSuccess?: () => void; // 리뷰 제출 성공 시 콜백 (옵션)
}

const ReviewForm: React.FC<ReviewFormProps> = ({ event_id, onClose, onReviewSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [image_urls, setimage_urls] = useState<File[]>([]); // 이미지 파일 상태 (최대 3개 가정)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // 이미지 미리보기 URL 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 별점 클릭 핸들러
  const handleRating = (rate: number) => {
    setRating(rate);
  };

  // 이미지 변경 핸들러 (실제 업로드 로직은 복잡하므로 여기서는 미리보기만 구현)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && image_urls.length < 3) {
      const file = e.target.files[0];
      if (file) {
        setimage_urls([...image_urls, file]);
        // 미리보기 URL 생성
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews([...imagePreviews, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
     // input 값 초기화 (같은 파일 다시 선택 가능하도록)
     e.target.value = ''; 
  };

  // 이미지 삭제 핸들러 (미리보기 및 파일 상태에서 제거)
  const handleRemoveImage = (indexToRemove: number) => {
      setimage_urls(image_urls.filter((_, index) => index !== indexToRemove));
      setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };


  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 간단한 유효성 검사
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // --- 🚨 실제 API 호출 로직 ---
      // FormData를 사용하여 텍스트 데이터와 이미지 파일 전송
      const payload: R.CreateReviewPayload = {
        event_id: event_id, // props로 받은 eventId 사용
        title: title,     // state 변수 title 사용
        content: content,   // state 변수 content 사용
        rating: rating,     // state 변수 rating 사용
        image_urls: []    // 👈 이미지 URL 배열 (파일 직접 전송 불가)
        // 만약 이미지 업로드 후 URL 배열이 있다면 여기에 할당:
        // image_urls: uploadedImageUrls, 
      };

      console.log('리뷰 제출 데이터:', { event_id, title, content, rating, image_urls });
      const response = await ReviewApi.createReview(payload); // API 호출

      // 성공 처리
      alert('리뷰가 성공적으로 작성되었습니다!');
      onReviewSubmitSuccess; // 부모에게 성공 알림 (목록 새로고침 등)
      onClose(); // 모달 닫기

    } catch (err) {
      console.error("리뷰 제출 실패:", err);
      setError("리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <S.FormContainer onSubmit={handleSubmit}>
      {/* 제목 */}
      <S.InputGroup>
        <S.Label htmlFor="reviewTitle">제목</S.Label>
        <S.Input
          id="reviewTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          disabled={isSubmitting}
        />
      </S.InputGroup>

      {/* 내용 */}
      <S.InputGroup>
        <S.Label htmlFor="reviewContent">내용</S.Label>
        <S.Textarea
          id="reviewContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          disabled={isSubmitting}
        />
      </S.InputGroup>

      {/* 별점 */}
      <S.RatingGroup>
        <S.Label>별점</S.Label>
        <S.StarsContainer>
          {[1, 2, 3, 4, 5].map((star) => (
            <S.StarButton
              key={star}
              type="button" // 폼 제출 방지
              $isActive={star <= rating}
              onClick={() => handleRating(star)}
              aria-label={`${star}점`}
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
          {/* 이미지 미리보기 */}
          {imagePreviews.map((previewUrl, index) => (
            <S.ImagePlaceholder key={index} onClick={() => handleRemoveImage(index)} title="클릭하여 삭제">
              <img src={previewUrl} alt={`preview ${index + 1}`} />
            </S.ImagePlaceholder>
          ))}
          {/* 이미지 추가 버튼 (3개 미만일 때만 보임) */}
          {image_urls.length < 3 && (
            <S.ImagePlaceholder as="label" htmlFor="reviewImageUpload"> {/* label로 변경 */}
              <FaPlus />
              <input 
                id="reviewImageUpload"
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ display: 'none' }} // input 숨기기
                disabled={isSubmitting}
              />
            </S.ImagePlaceholder>
          )}
        </S.ImagePreviewContainer>
      </S.ImageUploadGroup>

      {/* 에러 메시지 */}
      {error && <p style={{ color: 'red', textAlign: 'center', margin: 0 }}>{error}</p>}

      {/* 제출 버튼 */}
      <S.SubmitButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? '작성 중...' : '리뷰 작성'}
      </S.SubmitButton>
    </S.FormContainer>
  );
};

export default ReviewForm;