import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuthContext } from "../../contexts/AuthContext";
import { validateEventForm } from '../../utils/validation';
import { useEventUpdate } from '../../hooks/useEventCreate';
import type { EventFormData } from './EventCreatePage';
import * as E from '../../types/events';
import { deleteEvent, getEventById } from "../../services/eventsApi";
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
    FormSection,
    SectionTitle,
    SectionDescription,
    InputGroup,
    InputLabel,
    TextInput,
    TextArea,
    ErrorAlert,
    CharacterCount,
    FormActions,
    TwoColumn,
    LeftCol,
    RightCol,
    ExistingImagesContainer,
    ExistingImagesLabel,
    ExistingImagesGrid,
    ExistingImageItem,
    ExistingImage,
    RemoveImageButton,
    ErrorMessage,
    Form,
    RequiredMark,
    CancelButton,
    SubmitButton,
    DeleteButton,
    ButtonGroup,
} from '../../styles/EventUpdatePage.styles';

// 행사 게시물 수정 페이지 컴포넌트
export const EventUpdatePage: React.FC = () => {
    const params = useParams();
    const rawId = (params.id as string | undefined)
        ?? (params.eventId as string | undefined)
        ?? (params.event_id as string | undefined);
    const eventId = rawId ? Number(rawId) : NaN;
    const navigate = useNavigate();
    const auth = useAuthContext();
    const user = auth?.user;
    const isAuthenticated = !!user;

    const { updateEvent, isLoading, error } = useEventUpdate(eventId);

    // 폼 데이터 상태 (행사 생성 페이지에 있는 거 재활용)
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

    const [event, setEvent] = useState<E.Event | null>(null);
    const [_eventLoading, setEventLoading] = useState<boolean>(true);
    const [_eventError, setEventError] = useState<string | null>(null);

    // 권한 체크 및 초기 데이터 로드
    useEffect(() => {
        let mounted = true;
        (async () => {
            setEventLoading(true);
            setEventError(null);
            if (!Number.isFinite(eventId) || eventId <= 0) {
                setEventError('유효하지 않은 이벤트 ID입니다. URL을 확인해주세요.');
                setEventLoading(false);
                return;
            }
            try {
                const data = await getEventById(eventId);
                if (!mounted) return;

                // Event 타입 기준으로 상태 채우기
                setEvent(data as E.Event);

                // 기존 이미지
                setExistingImageUrls(Array.isArray((data as any).image_urls) ? (data as any).image_urls : []);

                // 폼 초기화
                setFormData(prev => ({
                    ...prev,
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
                    tags: Array.isArray((data as any).tags) ? (data as any).tags : [],
                }));
            } catch (e: any) {
                if (!mounted) return;
                setEventError(e?.message || '행사 정보를 불러오지 못했습니다.');
            } finally {
                if (mounted) setEventLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [eventId, setEventError, setEventLoading]);

    // 폼 필드 값 변경 처리
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

    // 이미지 변경 처리 (새로 업로드한 거)
    const handleImagesChange = (images: File[]) => {
        handleFieldChange('images', images);
    };

    // 기존 이미지 제거
    const handleRemoveExistingImage = (url: string) => {
        setExistingImageUrls(prev => prev.filter(u => u !== url));
        setRemovedImageUrls(prev => [...prev, url]);
    };

    // 날짜 범위 변경 처리
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
            images: formData.images,
            existingImages: existingImageUrls // 기존 이미지가 존재하는 경우
        });

        if (!validation.isValid) {
            const errorMap: Record<string, string> = {};
            validation.errors.forEach((error: { field: string | number; message: string; }) => {
                errorMap[error.field] = error.message;
            });
            setValidationErrors(errorMap);
            return false;
        }

        setValidationErrors({});
        return true;
    };

    // 허용된 태그 목록 (create_db.py에 있는 기본 태그 49개 그대로임)
    // TODO: 별도의 태그 API가 구현되면 이 부분 삭제하기 (현재는 태그 API가 없음)
    const ALLOWED_TAGS = [
        // 기본
        "행사", "이벤트", "온라인", "오프라인", "가볼만한곳", "주말에뭐하지",

        // 행사 종류별 - 문화예술
        "전시회", "콘서트", "페스티벌", "공연", "팬미팅", "영화",

        // 행사 종류별 - 상업/마켓
        "팝업스토어", "플리마켓", "박람회", "세일",

        // 행사 종류별 - 학습
        "세미나", "컨퍼런스", "강연", "워크숍", "클래스",

        // 행사 종류별 - 소셜
        "네트워킹", "파티", "소모임", "정모",

        // 행사 종류별 - 활동
        "원데이클래스", "스포츠", "게임", "여행", "봉사활동",

        // 행사 분위기별
        "힐링", "감성", "신나는", "액티비티", "조용한", "로맨틱",
        "핫플", "힙스터", "이색체험", "인생샷",

        // 행사 참여 대상
        "누구나", "가족나들이", "아이와함께", "커플추천", "친구랑",
        "혼자서도좋아", "직장인", "대학생", "반려동물동반"
    ];

    // 폼 제출 처리 부분
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // 태그 유효성 검사: 허용된 기본 태그 49개 이외에는 업로드 막기 (기본 태그 아닌 걸 사용하면 500 에러 터짐)
        // TODO: 별도의 태그 API가 구현되면 이 부분 삭제하기 (현재는 태그 API가 없음)
        const invalidTags = formData.tags.filter(t => !ALLOWED_TAGS.includes(t.trim()));
        if (invalidTags.length > 0) {
            alert(`현재 기본 태그 외의 새 태그는 등록할 수 없습니다.\n허용되지 않은 태그: ${invalidTags.join(', ')}`);
            return;
        }

        try {
            // 행사 수정 요청 데이터 구성 (행사 생성 요청과 같음)
            const updateRequest: E.CreateEventPayload = {
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
                tag_names: formData.tags.map(t => t.trim()).filter(Boolean),
            };

            // 행사 수정
            await updateEvent(updateRequest, formData.images, removedImageUrls);

            // 성공 시 행사 상세 페이지로 이동
            navigate(`/events/${eventId}`, {
                state: { message: '행사가 성공적으로 수정되었습니다.' }
            });
        } catch (error) {
            console.error('Failed to update events:', error);
            // 에러는 useEventUpdate 훅에서 처리됨
        }
    };

    // 취소 버튼 클릭 시
    const handleCancel = () => {
        if (window.confirm('수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
            navigate(`/events/${eventId}`);
        }
    };

    // 삭제 버튼 클릭 시
    const handleDelete = async () => {
        if (!window.confirm('정말로 이 행사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        try {
            await deleteEvent(eventId);
            alert('행사가 삭제되었습니다.');
            navigate('/');
        } catch (error) {
            console.error('Failed to delete events:', error);
            alert('행사 삭제에 실패했습니다.');
        }
    };

    // 로그인 필요 안내
    if (!isAuthenticated) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>로그인이 필요합니다</FormTitle>
                            <FormSubtitle>이 페이지에 접근하려면 먼저 로그인하세요.</FormSubtitle>
                        </FormHeader>
                    </FormContainer>
                </MainContent>
            </PageContainer>
        );
    }

    // event가 아직 없을 때 (로딩/ID 오류/404) 사용자에게 상태를 보여줌
    if (!event) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>{_eventLoading ? '불러오는 중…' : '행사 정보를 찾을 수 없습니다'}</FormTitle>
                            {(_eventError) && (
                                <FormSubtitle>{_eventError}</FormSubtitle>
                            )}
                        </FormHeader>
                    </FormContainer>
                </MainContent>
            </PageContainer>
        );
    }

    // 행사를 찾을 수 없거나 권한이 없는 경우 (안전장치)
    const userId = Number((user as any)?.id);
    const hostId = Number((event?.host as any)?.id);

    if (!Number.isFinite(userId)) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>로그인이 필요합니다</FormTitle>
                            <FormSubtitle>이 페이지에 접근하려면 먼저 로그인하세요.</FormSubtitle>
                        </FormHeader>
                    </FormContainer>
                </MainContent>
            </PageContainer>
        );
    }

    // 작성자 본인만 접근 가능
    if (userId !== hostId) {
        return (
            <PageContainer>
                <MainContent>
                    <FormContainer>
                        <FormHeader>
                            <FormTitle>접근 권한이 없습니다</FormTitle>
                            <FormSubtitle>작성자만 이 행사를 수정할 수 있습니다.</FormSubtitle>
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
                        <TwoColumn>
                            <LeftCol>
                                {/* 행사 이미지 업로드 (좌측) */}
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
                            </LeftCol>

                            <RightCol>
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
                            </RightCol>
                        </TwoColumn>
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
                                    {'수정 완료'}
                                </SubmitButton>
                            </ButtonGroup>
                        </FormActions>
                    </Form>
                </FormContainer>
            </MainContent>
        </PageContainer>
    );
};