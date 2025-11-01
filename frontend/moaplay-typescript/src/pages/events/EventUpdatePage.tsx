import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuthContext } from "../../context/AuthContext";
import { validateEventForm } from '../../utils/validation';
import { useEventUpdate } from '../../hooks/useEventCreate';
import type { EventFormData } from './EventCreatePage';
import * as E from '../../types/events';
import { deleteEvent, getEventById } from "../../service/eventsApi";
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
} from '../../styles/EventCreatePage.styles'; // 스타일을 CreatePage와 동일하게 사용

export const EventUpdatePage: React.FC = () => {
    const params = useParams<{ id?: string; eventId?: string; event_id?: string }>();
    const rawId = params.id ?? params.eventId ?? params.event_id;
    const eventId = rawId ? Number(rawId) : NaN;
    const navigate = useNavigate();
    const auth = useAuthContext();
    const user = auth?.user;
    const isAuthenticated = !!user;

    const { updateEvent, isLoading, error } = useEventUpdate(eventId);

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

    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [event, setEvent] = useState<E.Event | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setLoadError(null);
            if (!Number.isFinite(eventId) || eventId <= 0) {
                setLoadError('유효하지 않은 이벤트 ID입니다.');
                setLoading(false);
                return;
            }
            try {
                const data = await getEventById(eventId);
                if (!mounted) return;

                setEvent(data);
                setExistingImageUrls(Array.isArray((data as any).image_urls) ? (data as any).image_urls : []);

                setFormData({
                    images: [],
                    title: (data as any).title || '',
                    summary: (data as any).summary || '',
                    startDate: (data as any).start_date || '',
                    endDate: (data as any).end_date || '',
                    location: (data as any).location || '',
                    description: (data as any).description || '',
                    phone: (data as any).phone || '',
                    organizer: (data as any).host?.name || '',
                    hostedBy: (data as any).host?.organization || '',
                    tags: Array.isArray((data as any).tags) ? (data as any).tags : []
                });

            } catch (e: any) {
                if (!mounted) return;
                setLoadError(e?.message || '행사 정보를 불러올 수 없습니다.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [eventId]);

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

    const handleImagesChange = (images: File[]) => {
        handleFieldChange('images', images);
    };

    // 기존 이미지 URL을 미리보기용 객체로 변환하는 헬퍼
    const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
    };

    useEffect(() => {
    // 기존 이미지 URL을 File 객체로 변환해서 images 상태에 포함
    (async () => {
        const files = await Promise.all(
        existingImageUrls.map((url, idx) => urlToFile(url, `existing_${idx}.jpg`))
        );
        // 기존 이미지 + 새로 업로드한 이미지 합치기
        setFormData(prev => ({
        ...prev,
        images: [...files, ...prev.images]
        }));
    })();
    }, [existingImageUrls]);

    const handleRemoveExistingImage = (url: string) => {
        setExistingImageUrls(prev => prev.filter(u => u !== url));
        setRemovedImageUrls(prev => [...prev, url]);
    };

    const handleDateRangeChange = (startDate: string, endDate: string) => {
        handleFieldChange('startDate', startDate);
        handleFieldChange('endDate', endDate);
        if (validationErrors.startDate || validationErrors.endDate) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.startDate;
                delete newErrors.endDate;
                return newErrors;
            });
        }
    };

    const handleTagsChange = (tags: string[]) => {
        handleFieldChange('tags', tags);
    };

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
            // existingImages could be handled inside validation util if needed
        });
        if (!validation.isValid) {
            const errorMap: Record<string,string> = {};
            validation.errors.forEach(err => {
                errorMap[err.field] = err.message;
            });
            setValidationErrors(errorMap);
            return false;
        }
        setValidationErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            const updateRequest: E.CreateEventPayload = {
                title: formData.title.trim(),
                summary: formData.summary?.trim() || '',
                start_date: formData.startDate,
                end_date: formData.endDate,
                location: formData.location.trim(),
                description: formData.description.trim(),
                phone: formData.phone.trim(),
                organizer: formData.organizer?.trim() || '',
                hosted_by: formData.hostedBy?.trim() || '',
                image_urls: [] as string[], // 백엔드 요구사항에 맞게 세팅
                tag_names: formData.tags.map(t => t.trim()).filter(Boolean)
            };
            await updateEvent(updateRequest, formData.images, removedImageUrls);
            navigate(`/events/${eventId}`, { state: { message: '행사가 성공적으로 수정되었습니다.' }});
        } catch (err) {
            console.error('행사 수정 실패:', err);
        }
    };

    const handleCancel = () => {
        if (window.confirm('작성 중인 내용이 사라집니다. 정말로 취소하시겠습니까?')) {
            navigate(`/events/${eventId}`);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('정말로 이 행사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }
        try {
            await deleteEvent(eventId);
            alert('행사가 삭제되었습니다.');
            navigate('/');
        } catch (err) {
            console.error('삭제 오류:', err);
            alert('삭제에 실패했습니다.');
        }
    };

    if (!isAuthenticated) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>로그인이 필요합니다</FormTitle>
                            <FormSubtitle>이 페이지에 접근하려면 먼저 로그인해주세요.</FormSubtitle>
                        </FormHeader>
                    </FormContainer>
                </MainContent>
            </PageContainer>
        );
    }

    if (loading) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>불러오는 중…</FormTitle>
                        </FormHeader>
                    </FormContainer>
                </MainContent>
            </PageContainer>
        );
    }

    if (!event) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>행사를 찾을 수 없습니다</FormTitle>
                            {loadError && <FormSubtitle>{loadError}</FormSubtitle>}
                        </FormHeader>
                    </FormContainer>
                </MainContent>
            </PageContainer>
        );
    }

    // 권한 체크: 예시로 host 역할만 가능하게
    const userId = user?.id;
    const hostId = (event.host as any)?.id;
    if (userId !== hostId && !(user?.role?.toLowerCase()==='admin')) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>접근 권한이 없습니다</FormTitle>
                            <FormSubtitle>작성자 또는 관리자만 이 행사 수정가능합니다.</FormSubtitle>
                        </FormHeader>
                    </FormContainer>
                </MainContent>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <MainContent>
                <FormContainer>
                    <FormHeader>
                        <FormTitle>행사 게시물 수정</FormTitle>
                        <FormSubtitle>행사 정보를 수정해주세요. 수정 후 승인 절차가 있을 수 있습니다.</FormSubtitle>
                    </FormHeader>

                    {error && (
                        <ErrorAlert>{error}</ErrorAlert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <FormSection>
                            <SectionTitle>행사 이미지</SectionTitle>
                            <SectionDescription>
                                기존 업로드된 이미지를 확인 및 제거할 수 있습니다.
                            </SectionDescription>
                        <ImageUploader
                            images={formData.images}
                            onImagesChange={handleImagesChange}
                            maxImages={5}
                            error={validationErrors.images}
                        />
                        </FormSection>

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
                                    onChange={e => handleFieldChange('title', e.target.value)}
                                    placeholder="행사 제목을 입력해주세요"
                                    hasError={!!validationErrors.title}
                                    maxLength={255}
                                />
                                {validationErrors.title && (
                                    <ErrorMessage>{validationErrors.title}</ErrorMessage>
                                )}
                                <CharacterCount>{formData.title.length}/255</CharacterCount>
                            </InputGroup>

                                <InputGroup>
                                    <InputLabel htmlFor="summary">한 줄 소개</InputLabel>
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
                                    <CharacterCount>{formData.summary ? formData.summary.length : 0}/500</CharacterCount>
                                </InputGroup>

                                <InputGroup>
                                    <InputLabel htmlFor="phone">연락처(전화번호) <RequiredMark>*</RequiredMark></InputLabel>
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
                                    <InputLabel htmlFor="location">개최 주소 <RequiredMark>*</RequiredMark></InputLabel>
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
                                    <InputLabel htmlFor="description">상세 설명 <RequiredMark>*</RequiredMark></InputLabel>
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
                                    <CharacterCount>{formData.description.length}/5000</CharacterCount>
                                </InputGroup>

                                <InputGroup>
                                    <InputLabel>태그 <RequiredMark>*</RequiredMark></InputLabel>
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
                            <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
                            <SubmitButton type="submit" disabled={isLoading}>수정 완료</SubmitButton>
                            <button type="button" onClick={handleDelete} style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}>
                                행사 삭제
                            </button>
                        </FormActions>
                    </Form>
                </FormContainer>
            </MainContent>
        </PageContainer>
    );
};

export default EventUpdatePage;