import React, {useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useAuth } from '../../hooks/useAuth';
import type { MyUserResponse, OtherUserResponse, Users } from '../../types/users';
import { changePassword, checkDuplicate, getMe, getUser, updateMe } from "../../services/usersApi";
import { uploadImage } from "../../services/uploadApi";

// 프로필 수정 폼 타입
interface ProfileUpdateFormData {
    nickname: string;
    email: string;
    phone?: string;
    profile_image?: string;
}

// 비밀번호 수정 폼 타입
interface ChangePasswordFormData {
    password: string;
    new_password: string;
    new_password_confirm?: string; // 프론트에서만 쓰는 검증용
}

// 프로필 정보 수정 페이지 컴포넌트
export const ProfileUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const authCtx = useAuth() as any;
    const currentUser = authCtx.user ?? authCtx.me ?? null;

    // 프로필 정보 수정 대상 사용자 (userId가 있으면 다른 사용자, 없으면 본인)
    const isEditingOther = !!userId;
    const targetUserId = userId ? parseInt(userId) : currentUser?.id;

    // 권한 확인: 관리자만 다른 사용자 정보 수 가능
    const canEditOther = currentUser?.role === 'admin';

    // 상태 관리
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 개별 필드 저장 진행 상태
    const [savingField, setSavingField] = useState<null | 'nickname' | 'email' | 'phone' | 'profile_image'>(null);
    const [checkingNickname, setCheckingNickname] = useState(false);
    // 닉네임 중복 검사 통과 여부: null(미확인) | true(통과) | false(실패)
    const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);

    // 공통 갱신 유틸
    const refreshTargetUser = async () => {
        const refreshedUser = isEditingOther && targetUserId
            ? await getUser(targetUserId)
            : await getMe();

        setTargetUser(refreshedUser as any);
        setFormData({
            nickname: 'nickname' in (refreshedUser as any) ? (refreshedUser as any).nickname : '',
            email: (refreshedUser as any).email || '',
            phone: (refreshedUser as any).phone || '',
            profile_image: (refreshedUser as any).profile_image || '',
        } as any);
        setNicknameAvailable(null);
        if ((refreshedUser as any).profile_image) {
            setProfileImagePreview((refreshedUser as any).profile_image);
        }
    };
    const [targetUser, setTargetUser] = useState<MyUserResponse | OtherUserResponse | Users | null>(null);
    const [formData, setFormData] = useState<ProfileUpdateFormData>({
        nickname: '',
        email: '',
        phone: '',
        profile_image: '',
    });

    // 비밀번호 변경 전용 폼 상태
    const [passwordForm, setPasswordForm] = useState<ChangePasswordFormData>({
        password: '',
        new_password: '',
        new_password_confirm: ''
    });

    const handlePasswordFieldChange = (field: keyof ChangePasswordFormData, value: string) => {
        setPasswordForm(prev => ({ ...prev, [field]: value }));
    };
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

    // 이미지 표시용 src (getImageUrl 없이 처리)
    const [imageSrc, setImageSrc] = useState<string>('/default-avatar.png');

    // 백엔드 경로나 절대 URL, dataURL을 모두 처리하는 로컬 변환기
    const resolveProfileImageUrl = (raw?: string | null): string => {
        if (!raw) return '/default-avatar.png';
        // 미리보기 dataURL
        if (/^data:image\//.test(raw)) return raw;
        // 절대 URL 여부
        try {
            new URL(raw);
            return raw; // http(s) 절대 경로
        } catch {
            // 상대 경로면 환경변수 기반으로 보정 (없으면 루트에 붙임)
            const base = (import.meta as any).env?.VITE_FILE_BASE_URL || '';
            if (base) return `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
            return `/${raw.replace(/^\//, '')}`;
        }
    };

    // 대상 사용자/미리보기 변경 시 이미지 src 재계산
    useEffect(() => {
        const raw = profileImagePreview || (targetUser && (targetUser as any).profile_image) || null;
        setImageSrc(resolveProfileImageUrl(raw));
    }, [profileImagePreview, targetUser]);

    // 권한 확인 (인증은 PrivateRoute에서 이미 확인됨)
    useEffect(() => {
        // 다른 사용자를 수정하려는데 관리자가 아닌 경우
        if (isEditingOther && !canEditOther) {
            navigate('/');
            return;
        }
    }, [isEditingOther, canEditOther, navigate]);

    // 사용자 정보 로딩
    useEffect(() => {
        const loadUserProfile = async () => {
            setError(null);
            setLoading(true);

            try {
                let userData: MyUserResponse | OtherUserResponse;

                if (isEditingOther) {
                    if (!targetUserId) {
                        throw new Error('잘못된 사용자 ID');
                    }
                    // 다른 사용자 정보 조회 (관리자만 가능)
                    userData = (await getUser(targetUserId)) as unknown as OtherUserResponse;
                } else {
                    // 본인 정보 조회 (컨텍스트가 비어 있어도 서버에서 가져오도록 보장)
                    userData = (await getMe()) as unknown as MyUserResponse;
                }

                setTargetUser(userData);
                setFormData({
                    nickname: 'nickname' in userData && typeof (userData as any).nickname === 'string' ? (userData as any).nickname : '',
                    email: 'email' in userData && typeof (userData as any).email === 'string' ? (userData as any).email : '',
                    phone: 'phone' in userData && typeof (userData as any).phone === 'string' ? (userData as any).phone : '',
                    profile_image: 'profile_image' in userData && typeof (userData as any).profile_image === 'string' ? (userData as any).profile_image : '',
                } as any);
                setPasswordForm({ password: '', new_password: '', new_password_confirm: '' });
                setNicknameAvailable(null);
                if ((userData as any).profile_image) {
                    setProfileImagePreview((userData as any).profile_image);
                }
            } catch (err) {
                console.error('사용자 정보 로드 실패:', err);
                setError('사용자 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [targetUserId, isEditingOther]);

    // 폼 필드 변경 처리
    const handleFieldChange = (field: keyof ProfileUpdateFormData, value: string | string[]) => {
        setFormData(prev => {
            return {...prev, [field]: value};
        });
        if (field === 'nickname') {
            setNicknameAvailable(null);
        }
    };

    // 프로필 이미지 처리
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 이미지 파일 검증
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            alert('이미지 크기는 5MB 이하여야 합니다.');
            return;
        }

        setProfileImageFile(file);

        // 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

// 프로필 이미지 업로드
    const uploadProfileImage = async (): Promise<string | null> => {
        if (!profileImageFile) return null;

        try {
            const result = await uploadImage(profileImageFile);
            return result.url;
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            throw error;
        }
    };

// 비밀번호 변경 전용 처리 (백엔드: PUT /users/me/password)
    const handleChangePassword = async (event: React.FormEvent) => {
        event.preventDefault();

        const current = passwordForm.password;
        const next = passwordForm.new_password;
        const nextConfirm = passwordForm.new_password_confirm;

        // 필드 검증
        if (!current || !next) {
            setError('현재 비밀번호와 새 비밀번호를 입력해주세요.');
            return;
        }
        if (next.length < 8) {
            setError('새 비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }
        if (nextConfirm && next !== nextConfirm) {
            setError('새 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await changePassword({ password: current, new_password: next } as any);
            alert('비밀번호가 변경되었습니다.');

            // 비밀번호 관련 입력값 초기화
            setPasswordForm({ password: '', new_password: '', new_password_confirm: '' });
        } catch (err) {
            console.error('비밀번호 변경 실패:', err);
            setError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 다시 확인해주세요.');
        } finally {
            setSaving(false);
        }
    };

// 단일 필드 업데이트 처리 (백엔드 elif 정책 대응)
    const handleUpdateField = async (field: 'nickname' | 'email' | 'phone') => {
        if (!targetUser) return;

        setError(null);
        setSavingField(field);

        try {
            // 변경 여부 확인
            const original = (targetUser as any)[field] ?? '';
            const next = (formData as any)[field] ?? '';
            if (original === next) {
                alert('변경된 내용이 없습니다.');
                return;
            }

            // 간단 검증
            if (field === 'email' && next && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(next)) {
                setError('이메일 형식이 올바르지 않습니다.');
                return;
            }

            await updateMe({ [field]: next } as any);
            alert('저장되었습니다.');
            await refreshTargetUser();
        } catch (err) {
            console.error('단일 필드 업데이트 실패:', err);
            setError('저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSavingField(null);
        }
    };

    // 닉네임 중복 확인
    const handleCheckNickname = async () => {
        const raw = formData.nickname ?? '';
        const nickname = raw.trim();
        if (!nickname) {
            alert('닉네임을 입력하세요.');
            return;
        }
        setCheckingNickname(true);
        try {
            // API 규약: /users/check?type=nickname&value={nickname}
            const result: any = await checkDuplicate({ type: 'nickname', value: nickname } as any);
            // 성공 시 True(사용 가능), 실패 시 False 또는 오류 응답을 가정
            const available =
                result === true ||
                result === 'true' ||
                (typeof result === 'object' && result && result.available === true);

            setNicknameAvailable(!!available);
            if (available) {
                alert('사용 가능한 닉네임입니다.');
            } else {
                setNicknameAvailable(false);
                alert('이미 사용 중인 닉네임입니다.');
            }
        } catch (err) {
            console.error('닉네임 중복 확인 실패:', err);
            // 일부 구현에서는 중복인 경우 오류로 떨어질 수 있으므로 사용자 친화적으로 안내
            setNicknameAvailable(false);
            alert('이미 사용 중인 닉네임이거나 확인에 실패했습니다.');
        } finally {
            setCheckingNickname(false);
        }
    };

    // 프로필 이미지 단일 저장
    const handleSaveProfileImage = async () => {
        setError(null);
        setSavingField('profile_image');

        try {
            if (!profileImageFile) {
                alert('업로드할 이미지를 먼저 선택하세요.');
                return;
            }
            const uploadedUrl = await uploadProfileImage();
            if (!uploadedUrl) {
                setError('이미지 업로드에 실패했습니다.');
                return;
            }
            await updateMe({ profile_image: uploadedUrl } as any);
            alert('프로필 이미지가 저장되었습니다.');
            setProfileImageFile(null);
            await refreshTargetUser();
        } catch (err) {
            console.error('프로필 이미지 저장 실패:', err);
            setError('프로필 이미지 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSavingField(null);
        }
    };

    // 취소 버튼 처리
    const handleCancel = () => {
        if (isEditingOther) {
            navigate(`/mypage`);
        } else {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <ErrorContainer>
                    <ErrorMessage>로딩 중…</ErrorMessage>
                </ErrorContainer>
            </PageContainer>
        );
    }

    if (!targetUser) {
        return (
            <PageContainer>
                <ErrorContainer>
                    <ErrorMessage>사용자 정보를 찾을 수 없습니다.</ErrorMessage>
                    <BackButton onClick={() => navigate('/')}>홈으로 돌아가기</BackButton>
                </ErrorContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <MainContent>
                <PageTitle>
                    {isEditingOther
                        ? `${targetUser.nickname}님의 프로필 정보 수정`
                        : '프로필 정보 수정'}
                </PageTitle>

                <FormContainer onSubmit={(e) => e.preventDefault()}>
                    <TwoColumn>
                        {/* LEFT: 프로필 이미지 섹션 */}
                        <LeftCol>
                            <Section>
                                <SectionTitle>프로필 사진</SectionTitle>
                                <ProfileImageSection>
                                    <ProfileImage
                                        src={imageSrc}
                                        alt="프로필 이미지"
                                        onError={() => {
                                            if (imageSrc !== '/default-avatar.png') {
                                                setImageSrc('/default-avatar.png');
                                            }
                                        }}
                                    />
                                    <ImageUploadButton>
                                        <HiddenFileInput
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            id="profile-image-input"
                                        />
                                        <label htmlFor="profile-image-input">사진 변경</label>
                                    </ImageUploadButton>
                                    <ImageHelpText>JPG, PNG 형식, 최대 5MB</ImageHelpText>
                                    <InlineActionButton
                                        type="button"
                                        onClick={handleSaveProfileImage}
                                        disabled={savingField === 'profile_image'}
                                        aria-label="프로필 이미지 저장"
                                    >
                                        {savingField === 'profile_image' ? '저장 중…' : '이미지 저장'}
                                    </InlineActionButton>
                                </ProfileImageSection>
                            </Section>
                        </LeftCol>

                        {/* RIGHT: 프로필 정보 섹션들 */}
                        <RightCol>
                            {/* 읽기 전용 정보 */}
                            <Section>
                                <SectionTitle>계정 정보 (수정 불가)</SectionTitle>

                                <ReadOnlyGroup>
                                    <Label>아이디</Label>
                                    <ReadOnlyValue>
                                        {targetUser.user_id || '소셜 로그인'}
                                    </ReadOnlyValue>
                                </ReadOnlyGroup>

                                <ReadOnlyGroup>
                                    <Label>역할</Label>
                                    <ReadOnlyValue>
                                        {'role' in targetUser && targetUser.role === 'admin' && '관리자'}
                                        {'role' in targetUser && targetUser.role === 'host' && '주최자'}
                                        {'role' in targetUser && targetUser.role === 'user' && '일반 사용자'}
                                        {!('role' in targetUser) && '일반 사용자'}
                                    </ReadOnlyValue>
                                </ReadOnlyGroup>

                                <ReadOnlyGroup>
                                    <Label>가입일</Label>
                                    <ReadOnlyValue>
                                        {targetUser && (targetUser as any).created_at
                                            ? new Date((targetUser as any).created_at).toLocaleDateString('ko-KR')
                                            : '미설정'}
                                    </ReadOnlyValue>
                                </ReadOnlyGroup>
                            </Section>

                            {/* 기본 정보 섹션 */}
                            <Section>
                                <SectionTitle>기본 정보</SectionTitle>

                                <FormGroup>
                                    <Label htmlFor="nickname">닉네임</Label>
                                    <InlineFieldRow>
                                        <Input
                                            id="nickname"
                                            type="text"
                                            value={formData.nickname}
                                            onChange={e => handleFieldChange('nickname', e.target.value)}
                                            placeholder="닉네임을 입력하세요"
                                        />
                                        <InlineActions>
                                            <InlineActionButton
                                                type="button"
                                                aria-label="닉네임 중복 검사"
                                                onClick={handleCheckNickname}
                                                disabled={checkingNickname || !(formData.nickname ?? '').trim()}
                                            >
                                                {checkingNickname ? '확인 중…' : '중복 검사'}
                                            </InlineActionButton>
                                            <InlineActionButton
                                                type="button"
                                                onClick={() => handleUpdateField('nickname')}
                                                disabled={savingField === 'nickname' || nicknameAvailable !== true}
                                                title={nicknameAvailable !== true ? '닉네임 중복 검사를 통과해야 변경할 수 있어요' : undefined}
                                                aria-label="닉네임 변경"
                                            >
                                                {savingField === 'nickname' ? '변경 중…' : '변경'}
                                            </InlineActionButton>
                                        </InlineActions>
                                    </InlineFieldRow>
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="phone_number">전화번호</Label>
                                    <InlineFieldRow>
                                        <Input
                                            id="phone_number"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => handleFieldChange('phone', e.target.value)}
                                            placeholder="전화번호를 입력하세요"
                                        />
                                        <InlineActionButton
                                            type="button"
                                            onClick={() => handleUpdateField('phone')}
                                            disabled={savingField === 'phone'}
                                            aria-label="전화번호 변경"
                                        >
                                            {savingField === 'phone' ? '변경 중…' : '변경'}
                                        </InlineActionButton>
                                    </InlineFieldRow>
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="email">이메일</Label>
                                    <InlineFieldRow>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={e => handleFieldChange('email', e.target.value)}
                                            placeholder="이메일을 입력하세요"
                                        />
                                        <InlineActionButton
                                            type="button"
                                            onClick={() => handleUpdateField('email')}
                                            disabled={savingField === 'email'}
                                            aria-label="이메일 변경"
                                        >
                                            {savingField === 'email' ? '변경 중…' : '변경'}
                                        </InlineActionButton>
                                    </InlineFieldRow>
                                </FormGroup>
                            </Section>

                            {/* 에러 및 버튼 */}
                            {error && <ErrorAlert>{error}</ErrorAlert>}

                            <ButtonGroup>
                                <CancelButton type="button" onClick={handleCancel}>
                                    취소
                                </CancelButton>
                            </ButtonGroup>
                        </RightCol>
                    </TwoColumn>
                </FormContainer>

                {/* 비밀번호 변경 섹션 */}
                <FormContainer onSubmit={handleChangePassword}>
                    <NarrowFormBody>
                        <Section>
                            <SectionTitle>비밀번호 변경</SectionTitle>

                            <FormGroup>
                                <Label htmlFor="password">현재 비밀번호</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordForm.password}
                                    onChange={e => handlePasswordFieldChange('password', e.target.value)}
                                    placeholder="현재 비밀번호"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="new_password">새 비밀번호</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={passwordForm.new_password}
                                    onChange={e => handlePasswordFieldChange('new_password', e.target.value)}
                                    placeholder="변경할 비밀번호 (8자 이상)"
                                />
                                <HelpText>비밀번호는 최소 8자 이상이어야 합니다.</HelpText>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="new_password_confirm">비밀번호 확인</Label>
                                <Input
                                    id="new_password_confirm"
                                    type="password"
                                    value={passwordForm.new_password_confirm || ''}
                                    onChange={e => handlePasswordFieldChange('new_password_confirm', e.target.value)}
                                    placeholder="비밀번호를 다시 입력하세요"
                                />
                            </FormGroup>

                            <FormGroup>
                                <SaveButton type="submit" disabled={saving}>
                                    {saving ? '변경 중…' : '비밀번호 변경'}
                                </SaveButton>
                            </FormGroup>
                        </Section>
                    </NarrowFormBody>
                </FormContainer>
            </MainContent>
        </PageContainer>
    );
};

// 스타일 컴포넌트들
const PageContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
`;

const MainContent = styled.main`
    flex: 1;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    width: 100%;
`;
const ErrorContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
`;

const PageTitle = styled.h1`
    margin: 0 0 30px 0;
    font-size: 28px;
    font-weight: 700;
    color: #333;
    text-align: center;
`;

const FormContainer = styled.form`
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Section = styled.section`
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid #e9ecef;

    &:last-of-type {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
`;

const SectionTitle = styled.h2`
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
`;

const ProfileImageSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
`;

const ProfileImage = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #e9ecef;
`;

const ImageUploadButton = styled.div`
    label {
        display: inline-block;
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background: #0056b3;
        }
    }
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const ImageHelpText = styled.p`
    margin: 0;
    font-size: 12px;
    color: #6c757d;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 14px;
    color: #333;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

const InlineFieldRow = styled.div`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
`;

const InlineActions = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const InlineActionButton = styled.button`
    padding: 10px 14px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #17a2b8;
    color: white;

    &:hover:not(:disabled) {
        background: #138496;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const HelpText = styled.p`
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #6c757d;
`;

const ReadOnlyGroup = styled.div`
    margin-bottom: 16px;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;
    align-items: center;

    &:last-child {
        margin-bottom: 0;
    }
`;

const ReadOnlyValue = styled.span`
    color: #6c757d;
    font-size: 14px;
`;

const ErrorAlert = styled.div`
    padding: 12px 16px;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    color: #721c24;
    font-size: 14px;
    margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 32px;
`;

const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

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

const ErrorMessage = styled.p`
    font-size: 16px;
    color: #dc3545;
    margin-bottom: 20px;
`;

const BackButton = styled.button`
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: #0056b3;
    }
`;


const NarrowFormBody = styled.div`
    width: 100%;
    max-width: 420px;
    margin: 0 auto; /* 좌우 동일 마진으로 중앙 정렬 */
`;

export default ProfileUpdatePage;

const TwoColumn = styled.div`
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const LeftCol = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const RightCol = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
`;