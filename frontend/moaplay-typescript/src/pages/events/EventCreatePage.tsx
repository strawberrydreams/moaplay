import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { validateEventForm } from '../../utils/validation';
import { useEventCreate } from "../../hooks/useEventCreate";
import * as E from "../../types/events";
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
} from '../../styles/EventCreatePage.styles';

// 행사 작성 폼 타입
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

// 신규 행사 작성 페이지 컴포넌트
export const EventCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { createEvent, isLoading, error } = useEventCreate();

    // 접근 가드: 주최자/관리자만 페이지 접근 허용
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
            const isAdmin = normalized === 'admin';
            const isHost = normalized === 'host';

            if (!isAdmin && !isHost) {
                alert('접근 권한이 없습니다. 행사 주최자와 관리자만 접근 가능합니다.');
                navigate('/');
            }
        } catch (err) {
            console.error(err);
        }
    }, [navigate]);

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

    // 폼 필드 값 변경 처리
    const handleFieldChange = (field: keyof EventFormData, value: string | File[] | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // 이미지 변경 처리
    const handleImagesChange = (images: File[]) => {
        handleFieldChange('images', images);
    };

    // 날짜 범위 변경 처리
    const handleDateRangeChange = (startDate: string, endDate: string) => {
        setFormData(prev => ({
            ...prev,
            startDate,
            endDate
        }));

        if (validationErrors.startDate || validationErrors.endDate) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.startDate;
                delete newErrors.endDate;
                return newErrors;
            });
        }
    };

    // 태그 변경 처리
    const handleTagsChange = (tags: string[]) => {
        handleFieldChange('tags', tags);
    };

    // 폼 유효성 검사
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

    // 허용된 태그 목록
    const PERMITTED_TAGS = [
        "행사", "이벤트", "온라인", "오프라인", "가볼만한곳", "주말에뭐하지",
        "전시회", "콘서트", "페스티벌", "공연", "팬미팅", "영화",
        "팝업스토어", "플리마켓", "박람회", "세일",
        "세미나", "컨퍼런스", "강연", "워크숍", "클래스",
        "네트워킹", "파티", "소모임", "정모",
        "원데이클래스", "스포츠", "게임", "여행", "봉사활동",
        "힐링", "감성", "신나는", "액티비티", "조용한", "로맨틱",
        "핫플", "힙스터", "이색체험", "인생샷",
        "누구나", "가족나들이", "아이와함께", "커플추천", "친구랑",
        "혼자서도좋아", "직장인", "대학생", "반려동물동반"
    ];

    // 폼 제출 처리
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const invalidTags = formData.tags.filter(t => !PERMITTED_TAGS.includes(t.trim()));
        if (invalidTags.length > 0) {
            alert(`허용되지 않은 태그가 포함되어 있습니다: ${invalidTags.join(', ')}`);
            return;
        }

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
                hosted_by: formData.hostedBy?.trim() || "",
                image_urls: [],
                tag_names: formData.tags.map(t => t.trim()).filter(Boolean)
            };

            const createdEvent = await createEvent(createRequest, formData.images, formData.tags);

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
                                <InputLabel htmlFor="hostedBy">주관</InputLabel>
                                <TextInput
                                    id="hostedBy"
                                    type="text"
                                    value={formData.hostedBy || ''}
                                    onChange={(e) => handleFieldChange('hostedBy', e.target.value)}
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
                                <TagSelector
                                    selectedTags={formData.tags}
                                    onTagsChange={handleTagsChange}
                                    maxTags={10}
                                    error={validationErrors.tags}
                                />
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
