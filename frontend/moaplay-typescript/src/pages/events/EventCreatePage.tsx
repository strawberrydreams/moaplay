import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { validateEventForm } from '../../utils/validation';
import { useEventCreate } from "../../hooks/useEventCreate";
import * as E from "../../types/events";
import {tagsApi} from "../../services/tagsApi"; 
import TagSelector from "../../components/events/TagSelector";
import { DateRangeSelector } from "../../components/events/DateRangeSelector";
import { ImageUploader } from "../../components/events/ImageUploader";
import {
  PageContainer,
  MainContent,
  FormContainer,
  FormHeader,
  FormTitle,
  FormSubtitle,
  Form,
  FormSection,
  SectionTitle,
  SectionDescription,
  InputGroup,
  InputLabel,
  TextInput,
  TextArea,
  ErrorMessage,
  CharacterCount,
  FormActions,
  CancelButton,
  SubmitButton,
  ErrorAlert,
  RequiredMark,
} from '../../styles/pages/EventCreatePage.styles';

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
  hosted_By?: string;
  tags: string[];
}

export const EventCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent, isLoading, error } = useEventCreate();

  // 접근 가드
  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem('currentUser') ||
        window.sessionStorage.getItem('currentUser');
      if (!stored) return;

      const obj: any = JSON.parse(stored);
      const roleRaw = obj?.role ?? obj?.roles ?? '';
      const roleStr = Array.isArray(roleRaw) ? roleRaw.join(',') : String(roleRaw || '');
      const normalized = roleStr.toLowerCase();

      if (!(normalized === 'admin' || normalized === 'host')) {
        alert('접근 권한이 없습니다. 행사 주최자와 관리자만 접근 가능합니다.');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  }, [navigate]);

  // 태그 목록 상태
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagLoading, setTagLoading] = useState(true);
  const [tagError, setTagError] = useState<string | null>(null);

  // 태그 목록 불러오기
  useEffect(() => {
    (async () => {
      try {
        setTagLoading(true);
        const data = await tagsApi.list(); // [{ id, name, created_at }]
        const tagNames = (data || []).map((t: any) => t.name);
        setAvailableTags(tagNames);
      } catch (err) {
        console.error("태그 불러오기 실패:", err);
        setTagError("태그 목록을 불러오지 못했습니다.");
      } finally {
        setTagLoading(false);
      }
    })();
  }, []);

  // 폼 데이터
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
    hosted_By: '',
    tags: []
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof EventFormData, value: string | File[] | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImagesChange = (images: File[]) => handleFieldChange('images', images);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFormData(prev => ({ ...prev, startDate, endDate }));
    if (validationErrors.startDate || validationErrors.endDate) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        delete newErrors.endDate;
        return newErrors;
      });
    }
  };

  const handleTagsChange = (tags: string[]) => handleFieldChange('tags', tags);

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
      validation.errors.forEach((errItem: { field: string | number; message: string; }) => {
        errorMap[errItem.field] = errItem.message;
      });
      setValidationErrors(errorMap);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const createRequest: E.CreateEventPayload = {
        title: formData.title.trim(),
        summary: formData.summary?.trim() || "",
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        organizer: formData.organizer?.trim() || "",
        hosted_by: formData.hosted_By?.trim() || "",
        image_urls: [],
        tag_names: formData.tags.map(t => t.trim()).filter(Boolean)
      };

      await createEvent(createRequest, formData.images, formData.tags);

      alert('행사가 성공적으로 등록되었습니다. 관리자 승인 후 공개됩니다.');
      navigate('/');
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      navigate('/');
    }
  };


    return (
        <PageContainer>
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
                        {/* 이미지 업로드 섹션 */}
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

                        {/* 정보 섹션 */}
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
                                    {(formData.summary || "").length}/500
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
                                />
                            </InputGroup>

                            <InputGroup>
                                <InputLabel htmlFor="hosted_By">주관</InputLabel>
                                <TextInput
                                    id="hosted_By"
                                    type="text"
                                    value={formData.hosted_By || ''}
                                    onChange={(e) => handleFieldChange('hosted_By', e.target.value)}
                                />
                            </InputGroup>
                        </FormSection>

                        {/* 일정 및 장소 섹션 */}
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

                        {/* 상세 정보 섹션 */}
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
                                {/* 태그 로딩 상태 처리 */}
                                {tagLoading ? (
                                <p style={{ color: '#777' }}>태그 불러오는 중...</p>
                                ) : tagError ? (
                                <ErrorMessage>{tagError}</ErrorMessage>
                                ) : (
                                <TagSelector
                                    availableTags={availableTags} // 실제 DB 태그 전달
                                    selectedTags={formData.tags}
                                    onTagsChange={handleTagsChange}
                                    maxTags={10}
                                    error={validationErrors.tags}
                                />
                                )}
                            </InputGroup>
                        </FormSection>

                        <FormActions>
                            <CancelButton type="button" onClick={handleCancel}>
                                취소
                            </CancelButton>
                            <SubmitButton type="submit" disabled={isLoading}>
                                행사 등록
                            </SubmitButton>
                        </FormActions>
                    </Form>
                </FormContainer>
            </MainContent>
        </PageContainer>
    );
};

export default EventCreatePage;
