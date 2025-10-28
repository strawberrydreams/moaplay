/**
 * 행사 게시물 수정 페이지 컴포넌트
 * 
 * 주최자가 자신이 등록한 행사를 수정할 수 있는 폼 페이지입니다.
 * 이미지 업로드, 날짜 선택, 태그 선택 등의 기능을 제공합니다.
 * 
 * 권한: 행사를 등록한 주최자(host)만 수정 가능
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { ImageUploader, DateRangeSelector, TagSelector } from '../components/event';
import { useEventUpdate } from '../hooks';
import { useEventDetail } from '../hooks';
import { useAuth } from '../hooks';
import { EventUpdateRequest } from '../types/events';
import { validateEventForm } from '../utils/validation';
import { EventFormData } from './EventCreatePage';

/**
 * 행사 게시물 수정 페이지 컴포넌트
 */
export const EventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const eventId = parseInt(id || '0', 10);
  
  const { event, loading: eventLoading, error: eventError } = useEventDetail(eventId);
  const { updateEvent, isLoading, error } = useEventUpdate(eventId);

  // 폼 데이터 상태
  const [formData, setFormData] = useState<EventFormData>({
    images: [],
    title: '',
    summary: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    phone: '',
    organizer: '',
    hostedBy: '',
    tags: []
  });

  // 기존 이미지 URL 상태
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

  // 폼 검증 에러 상태
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 권한 체크 및 초기 데이터 로드
  useEffect(() => {
    if (eventLoading) return;

    // 행사를 찾을 수 없는 경우
    if (eventError || !event) {
      alert('행사를 찾을 수 없습니다.');
      navigate('/');
      return;
    }

    // 권한 체크: 작성자 또는 관리자만 수정 가능
    if (user?.id !== event.hostId && user?.role !== 'admin') {
      alert('행사를 수정할 권한이 없습니다.');
      navigate(`/events/${eventId}`);
      return;
    }

    // 폼 데이터 초기화
    setFormData({
      images: [],
      title: event.title,
      summary: event.summary || '',
      startDate: event.startDate || '',
      endDate: event.endDate || '',
      location: event.location || '',
      description: event.description || '',
      phone: event.phone || '',
      organizer: event.organizer || '',
      hostedBy: event.hostedBy || '',
      tags: event.tags
    });

    // 기존 이미지 URL 설정
    setExistingImageUrls(event.imageUrls);
  }, [event, eventLoading, eventError, user, eventId, navigate]);

  /**
   * 폼 필드 값 변경 처리
   */
  const handleFieldChange = (field: keyof EventFormData, value: string | File[] | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 해당 필드의 검증 에러 제거
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * 새 이미지 변경 처리
   */
  const handleImagesChange = (images: File[]) => {
    handleFieldChange('images', images);
  };

  /**
   * 기존 이미지 제거 처리
   */
  const handleRemoveExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(u => u !== url));
    setRemovedImageUrls(prev => [...prev, url]);
  };

  /**
   * 날짜 범위 변경 처리
   */
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate
    }));

    // 날짜 관련 검증 에러 제거
    if (validationErrors.startDate || validationErrors.endDate) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

  /**
   * 태그 변경 처리
   */
  const handleTagsChange = (tags: string[]) => {
    handleFieldChange('tags', tags);
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    const validation = validateEventForm({
      title: formData.title,
      summary: formData.summary,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
      description: formData.description,
      phone: formData.phone,
      tags: formData.tags,
      images: formData.images,
      existingImages: existingImageUrls
    });

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setValidationErrors(errorMap);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  /**
   * 폼 제출 처리
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // 행사 수정 요청 데이터 구성
      const updateRequest: EventUpdateRequest = {
        title: formData.title.trim(),
        summary: formData.summary?.trim() || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        organizer: formData.organizer?.trim() || undefined,
        hosted_by: formData.hostedBy?.trim() || undefined,
        tag_names: formData.tags
      };

      // 행사 수정
      await updateEvent(updateRequest, formData.images, removedImageUrls);

      // 성공 시 행사 상세 페이지로 이동
      navigate(`/events/${eventId}`, {
        state: { message: '행사가 성공적으로 수정되었습니다.' }
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      // 에러는 useEventUpdate 훅에서 처리됨
    }
  };

  /**
   * 취소 버튼 클릭 처리
   */
  const handleCancel = () => {
    if (window.confirm('수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      navigate(`/events/${eventId}`);
    }
  };

  /**
   * 삭제 버튼 클릭 처리
   */
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 행사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const { EventService } = await import('../services/eventService');
      await EventService.deleteEvent(eventId);
      alert('행사가 삭제되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('행사 삭제에 실패했습니다.');
    }
  };

  // 로딩 중
  if (eventLoading) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <Loading />
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  // 행사를 찾을 수 없거나 권한이 없는 경우 (useEffect에서 처리되지만 안전장치)
  if (!event || (user?.id !== event.hostId && user?.role !== 'admin')) {
    return null;
  }

  return (
    <PageContainer>
      <Header />

      <MainContent>
        <FormContainer>
          <FormHeader>
            <FormTitle>행사 게시물 수정</FormTitle>
            <FormSubtitle>
              행사 정보를 수정해주세요. 수정 후 관리자 승인이 필요할 수 있습니다.
            </FormSubtitle>
          </FormHeader>

          {error && (
            <ErrorAlert>
              {error}
            </ErrorAlert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* 행사 이미지 업로드 */}
            <FormSection>
              <SectionTitle>행사 이미지</SectionTitle>
              <SectionDescription>
                행사를 대표하는 이미지를 업로드해주세요. (최대 5개, 각 16MB 이하)
              </SectionDescription>
              
              {/* 기존 이미지 표시 */}
              {existingImageUrls.length > 0 && (
                <ExistingImagesContainer>
                  <ExistingImagesLabel>기존 이미지</ExistingImagesLabel>
                  <ExistingImagesGrid>
                    {existingImageUrls.map((url, index) => (
                      <ExistingImageItem key={url}>
                        <ExistingImage src={url} alt={`기존 이미지 ${index + 1}`} />
                        <RemoveImageButton
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          title="이미지 제거"
                        >
                          ×
                        </RemoveImageButton>
                      </ExistingImageItem>
                    ))}
                  </ExistingImagesGrid>
                </ExistingImagesContainer>
              )}
              
              {/* 새 이미지 업로드 */}
              <ImageUploader
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5 - existingImageUrls.length}
                error={validationErrors.images}
              />
            </FormSection>

            {/* 기본 정보 */}
            <FormSection>
              <SectionTitle>기본 정보</SectionTitle>

              <InputGroup>
                <InputLabel htmlFor="title">
                  행사 제목 <RequiredMark>*</RequiredMark>
                </InputLabel>
                <TextInput
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="행사 제목을 입력해주세요"
                  hasError={!!validationErrors.title}
                  maxLength={255}
                />
                {validationErrors.title && (
                  <ErrorMessage>{validationErrors.title}</ErrorMessage>
                )}
                <CharacterCount>
                  {formData.title.length}/255
                </CharacterCount>
              </InputGroup>

              <InputGroup>
                <InputLabel htmlFor="summary">
                  한 줄 소개
                </InputLabel>
                <TextInput
                  id="summary"
                  type="text"
                  value={formData.summary}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  placeholder="행사를 한 줄로 소개해주세요"
                  hasError={!!validationErrors.summary}
                  maxLength={500}
                />
                {validationErrors.summary && (
                  <ErrorMessage>{validationErrors.summary}</ErrorMessage>
                )}
                <CharacterCount>
                  {formData.summary ? formData.summary.length : 0}/500
                </CharacterCount>
              </InputGroup>

              <InputGroup>
                <InputLabel htmlFor="phone">
                  연락처(전화번호) <RequiredMark>*</RequiredMark>
                </InputLabel>
                <TextInput
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="예: 010-1234-5678"
                  hasError={!!validationErrors.phone}
                />
                {validationErrors.phone && (
                  <ErrorMessage>{validationErrors.phone}</ErrorMessage>
                )}
              </InputGroup>

              <InputGroup>
                <InputLabel htmlFor="organizer">주최자</InputLabel>
                <TextInput
                  id="organizer"
                  type="text"
                  value={formData.organizer || ''}
                  onChange={(e) => handleFieldChange('organizer', e.target.value)}
                  placeholder="예: 한국IT협회"
                />
              </InputGroup>

              <InputGroup>
                <InputLabel htmlFor="hostedBy">주관</InputLabel>
                <TextInput
                  id="hostedBy"
                  type="text"
                  value={formData.hostedBy || ''}
                  onChange={(e) => handleFieldChange('hostedBy', e.target.value)}
                  placeholder="예: ABC컨벤션"
                />
              </InputGroup>
            </FormSection>

            {/* 일정 및 장소 */}
            <FormSection>
              <SectionTitle>일정 및 장소</SectionTitle>

              <DateRangeSelector
                startDate={formData.startDate}
                endDate={formData.endDate}
                onChange={handleDateRangeChange}
                startDateError={validationErrors.startDate}
                endDateError={validationErrors.endDate}
              />

              <InputGroup>
                <InputLabel htmlFor="location">
                  개최 주소 <RequiredMark>*</RequiredMark>
                </InputLabel>
                <TextInput
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="행사가 열리는 정확한 주소를 입력해주세요"
                  hasError={!!validationErrors.location}
                />
                {validationErrors.location && (
                  <ErrorMessage>{validationErrors.location}</ErrorMessage>
                )}
              </InputGroup>
            </FormSection>

            {/* 상세 정보 */}
            <FormSection>
              <SectionTitle>상세 정보</SectionTitle>

              <InputGroup>
                <InputLabel htmlFor="description">
                  상세 설명 <RequiredMark>*</RequiredMark>
                </InputLabel>
                <TextArea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="행사에 대한 자세한 설명을 입력해주세요"
                  hasError={!!validationErrors.description}
                  rows={8}
                  maxLength={5000}
                />
                {validationErrors.description && (
                  <ErrorMessage>{validationErrors.description}</ErrorMessage>
                )}
                <CharacterCount>
                  {formData.description.length}/5000
                </CharacterCount>
              </InputGroup>

              <InputGroup>
                <InputLabel>
                  태그 <RequiredMark>*</RequiredMark>
                </InputLabel>
                <TagSelector
                  selectedTags={formData.tags}
                  onTagsChange={handleTagsChange}
                  maxTags={10}
                  error={validationErrors.tags}
                />
              </InputGroup>
            </FormSection>

            {/* 제출 버튼 */}
            <FormActions>
              <DeleteButton type="button" onClick={handleDelete}>
                행사 삭제
              </DeleteButton>
              <ButtonGroup>
                <CancelButton type="button" onClick={handleCancel}>
                  취소
                </CancelButton>
                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? <Loading size="sm" /> : '수정 완료'}
                </SubmitButton>
              </ButtonGroup>
            </FormActions>
          </Form>
        </FormContainer>
      </MainContent>

      <Footer />
    </PageContainer>
  );
};

// 스타일 컴포넌트들
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px 20px;
`;

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const FormHeader = styled.div`
  padding: 40px 40px 20px;
  border-bottom: 1px solid #e9ecef;
`;

const FormTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
`;

const FormSubtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: #6c757d;
`;

const ErrorAlert = styled.div`
  margin: 20px 40px;
  padding: 16px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  font-size: 14px;
`;

const Form = styled.form`
  padding: 20px 40px 40px;
`;

const FormSection = styled.div`
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const SectionDescription = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #6c757d;
`;

const ExistingImagesContainer = styled.div`
  margin-bottom: 20px;
`;

const ExistingImagesLabel = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ExistingImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const ExistingImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e9ecef;
`;

const ExistingImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(220, 53, 69, 1);
  }
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const RequiredMark = styled.span`
  color: #dc3545;
`;

const TextInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e9ecef'};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const TextArea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e9ecef'};
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #dc3545;
`;

const CharacterCount = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #6c757d;
  text-align: right;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
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

const DeleteButton = styled(Button)`
  background: #dc3545;
  color: white;
  
  &:hover:not(:disabled) {
    background: #c82333;
  }
`;

export default EventEditPage;
