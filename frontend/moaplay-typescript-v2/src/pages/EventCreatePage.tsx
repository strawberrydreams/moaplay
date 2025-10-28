/**
 * 행사 게시물 작성 페이지 컴포넌트
 * 
 * 주최자가 새로운 행사를 등록할 수 있는 폼 페이지입니다.
 * 이미지 업로드, 날짜 선택, 태그 선택 등의 기능을 제공합니다.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { ImageUploader, DateRangeSelector, TagSelector } from '../components/event';
import { useEventCreate } from '../hooks';
import { CreateEventRequest } from '../services/eventService';
import { validateEventForm } from '../utils/validation';

/**
 * 행사 작성 폼 데이터 타입
 */
export interface EventFormData {
  images: File[];
  title: string;
  summary?: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  phone: string;
  organizer?: string;
  hostedBy?: string;
  tags: string[];
}

/**
 * 행사 게시물 작성 페이지 컴포넌트
 */
export const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent, isLoading, error } = useEventCreate();

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

  // 폼 검증 에러 상태
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
   * 이미지 변경 처리
   */
  const handleImagesChange = (images: File[]) => {
    handleFieldChange('images', images);
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
      images: formData.images
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
      // 행사 생성 요청 데이터 구성
      const createRequest: CreateEventRequest = {
        title: formData.title.trim(),
        summary: formData.summary?.trim() || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        organizer: formData.organizer?.trim() || undefined,
        hosted_by: formData.hostedBy?.trim() || undefined,
        image_urls: [], // 이미지 업로드 후 URL 설정
        hashtag: formData.tags
      };

      // 행사 생성
      const createdEvent = await createEvent(createRequest, formData.images, formData.tags);

      // 성공 시 행사 상세 페이지로 이동
      navigate(`/events/${createdEvent.id}`, {
        state: { message: '행사가 성공적으로 등록되었습니다. 관리자 승인 후 공개됩니다.' }
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      // 에러는 useEventCreate 훅에서 처리됨
    }
  };

  /**
   * 취소 버튼 클릭 처리
   */
  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      navigate('/');
    }
  };

  return (
    <PageContainer>
      <Header />

      <MainContent>
        <FormContainer>
          <FormHeader>
            <FormTitle>행사 게시물 작성</FormTitle>
            <FormSubtitle>
              새로운 행사를 등록해주세요. 관리자 승인 후 공개됩니다.
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
              <ImageUploader
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
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
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? <Loading size="sm" /> : '행사 등록'}
              </SubmitButton>
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
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
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

export default EventCreatePage;