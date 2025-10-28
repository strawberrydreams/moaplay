/**
 * 프로필 편집 페이지
 *
 * 사용자가 자신의 프로필 정보를 수정할 수 있는 페이지입니다.
 * 관리자는 다른 사용자의 프로필도 수정할 수 있습니다.
 *
 * 권한:
 * - 일반 사용자: 자신의 프로필만 수정 가능
 * - 관리자: 모든 사용자의 프로필 수정 가능
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { useAuth } from '../hooks';
import { UserService } from '../services/userService';
import { AdminService } from '../services/adminService';
import { UserMeResponse, UserPublicResponse } from '../types/users';
import { getImageUrl, handleImageError } from '../utils/image';

/**
 * 프로필 편집 폼 데이터 타입
 */
interface ProfileFormData {
  email: string;
  phone_number: string;
  preferred_tags: string[];
  password?: string;
  password_confirm?: string;
}

/**
 * 프로필 편집 페이지 컴포넌트
 */
export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser } = useAuth();

  // 편집 대상 사용자 (userId가 있으면 다른 사용자, 없으면 본인)
  const isEditingOther = !!userId;
  const targetUserId = userId ? parseInt(userId) : currentUser?.id;

  // 권한 확인: 관리자만 다른 사용자 편집 가능
  const canEditOther = currentUser?.role === 'admin';

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<UserMeResponse | UserPublicResponse | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    email: '',
    phone_number: '',
    preferred_tags: [],
    password: '',
    password_confirm: '',
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  /**
   * 권한 확인 (인증은 PrivateRoute에서 이미 확인됨)
   */
  useEffect(() => {
    // 다른 사용자를 편집하려는데 관리자가 아닌 경우
    if (isEditingOther && !canEditOther) {
      navigate('/forbidden');
      return;
    }
  }, [isEditingOther, canEditOther, navigate]);

  /**
   * 사용자 정보 로드
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!targetUserId) return;

      setLoading(true);
      setError(null);

      try {
        let userData: UserPublicResponse;

        if (isEditingOther) {
          // 다른 사용자 정보 조회 (관리자만 가능)
          userData = await UserService.getUser(targetUserId);
        } else {
          // 본인 정보 조회
          userData = await UserService.getMe();
        }

        setTargetUser(userData);
        setFormData({
          email:
            ('email' in userData && typeof (userData as any).email === 'string'
              ? (userData as any).email
              : ''),
          phone_number:
            ('phone' in userData && typeof (userData as any).phone === 'string'
              ? (userData as any).phone
              : ''),
          preferred_tags:
            ('preferred_tags' in userData && Array.isArray((userData as any).preferred_tags)
              ? (userData as any).preferred_tags
              : []),
          password: '',
          password_confirm: '',
        });

        if (userData.profile_image) {
          setProfileImagePreview(userData.profile_image);
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

  /**
   * 폼 필드 변경 처리
   */
  const handleFieldChange = (field: keyof ProfileFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * 프로필 이미지 선택 처리
   */
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

  /**
   * 프로필 이미지 업로드
   */
  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImageFile) return null;

    try {
      const { UploadService } = await import('../services/uploadService');
      const result = await UploadService.uploadImage(profileImageFile);
      return result.url;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  };

  /**
   * 폼 제출 처리
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!targetUserId) return;

    // 비밀번호 유효성 검사
    if (formData.password && formData.password !== formData.password_confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 프로필 이미지 업로드 (변경된 경우)
      let profileImageUrl: string | undefined;
      if (profileImageFile) {
        const uploadedUrl = await uploadProfileImage();
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }

      // 프로필 업데이트 데이터 준비
      const updateData: any = {};
      
      // 변경된 필드만 포함
      if (formData.email !== (targetUser as any).email) {
        updateData.email = formData.email;
      }
      if (formData.phone_number !== (targetUser as any).phone) {
        updateData.phone = formData.phone_number;
      }
      if (JSON.stringify(formData.preferred_tags) !== JSON.stringify((targetUser as any).preferred_tags || [])) {
        updateData.preferred_tags = formData.preferred_tags;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }
      if (profileImageUrl) {
        updateData.profile_image = profileImageUrl;
      }

      // 변경사항이 없으면 알림
      if (Object.keys(updateData).length === 0) {
        alert('변경된 내용이 없습니다.');
        return;
      }

      if (isEditingOther && canEditOther) {
        // 관리자가 다른 사용자 정보 수정
        await AdminService.updateUser(targetUserId, updateData);
        alert('사용자 정보가 성공적으로 수정되었습니다.');
        navigate(`/users/${targetUserId}/profile`);
      } else {
        // 본인 정보 수정
        await UserService.updateMe(updateData);
        alert('프로필이 성공적으로 수정되었습니다.');

        // 서버에서 최신 내 프로필 다시 조회하여 정확한 타입(UserMeResponse)을 반영
        const refreshedUser = await UserService.getMe();

        // 업데이트된 정보로 상태 갱신 (refreshedUser는 UserMeResponse 타입을 만족)
        setTargetUser(refreshedUser);
        setFormData({
          email: refreshedUser.email || '',
          phone_number: refreshedUser.phone || '',
          preferred_tags: refreshedUser.preferred_tags || [],
          password: '',
          password_confirm: '',
        });

        if (refreshedUser.profile_image) {
          setProfileImagePreview(refreshedUser.profile_image);
        }

        // 프로필 페이지로 이동
        navigate('/profile');
      }
    } catch (err) {
      console.error('프로필 수정 실패:', err);
      setError('프로필 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 취소 버튼 처리
   */
  const handleCancel = () => {
    if (isEditingOther) {
      navigate(`/users/${targetUserId}/profile`);
    } else {
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
        <Footer />
      </PageContainer>
    );
  }

  if (!targetUser) {
    return (
      <PageContainer>
        <Header />
        <ErrorContainer>
          <ErrorMessage>사용자 정보를 찾을 수 없습니다.</ErrorMessage>
          <BackButton onClick={() => navigate('/')}>홈으로 돌아가기</BackButton>
        </ErrorContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />

      <MainContent>
        <PageTitle>
          {isEditingOther
            ? `${targetUser.nickname}님의 프로필 편집`
            : '프로필 편집'}
        </PageTitle>

        <FormContainer onSubmit={handleSubmit}>
          {/* 프로필 이미지 섹션 */}
          <Section>
            <SectionTitle>프로필 사진</SectionTitle>
            <ProfileImageSection>
              <ProfileImage
                src={
                  profileImagePreview ||
                  (targetUser.profile_image ? getImageUrl(targetUser.profile_image) : '/default-avatar.png')
                }
                alt="프로필 이미지"
                onError={(e) => handleImageError(e, '/default-avatar.png')}
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
            </ProfileImageSection>
          </Section>

          {/* 기본 정보 섹션 */}
          <Section>
            <SectionTitle>기본 정보</SectionTitle>

            <FormGroup>
              <Label htmlFor="phone_number">전화번호</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={e =>
                  handleFieldChange('phone_number', e.target.value)
                }
                placeholder="전화번호를 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="preferred_tags">선호 태그</Label>
              <Input
                id="preferred_tags"
                type="text"
                value={formData.preferred_tags.join(', ')}
                onChange={e =>
                  handleFieldChange('preferred_tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))
                }
                placeholder="쉼표로 구분하여 입력하세요 (예: 음악, 전시, 공연)"
              />
              <HelpText>관심 있는 태그를 쉼표로 구분하여 입력하세요.</HelpText>
            </FormGroup>
          </Section>

          {/* 비밀번호 변경 섹션 */}
          <Section>
            <SectionTitle>비밀번호 변경</SectionTitle>

            <FormGroup>
              <Label htmlFor="password">새 비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={e => handleFieldChange('password', e.target.value)}
                placeholder="변경할 비밀번호를 입력하세요 (선택)"
              />
              <HelpText>비밀번호는 최소 8자 이상이어야 합니다.</HelpText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password_confirm">비밀번호 확인</Label>
              <Input
                id="password_confirm"
                type="password"
                value={formData.password_confirm}
                onChange={e => handleFieldChange('password_confirm', e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => handleFieldChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </FormGroup>
          </Section>

          {/* 읽기 전용 정보 */}
          <Section>
            <SectionTitle>계정 정보 (수정 불가)</SectionTitle>

            <ReadOnlyGroup>
              <Label>이름</Label>
              <ReadOnlyValue>
                {'real_name' in targetUser ? (targetUser as any).real_name : '미설정'}
              </ReadOnlyValue>
            </ReadOnlyGroup>

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
                {new Date(targetUser.created_at).toLocaleDateString('ko-KR')}
              </ReadOnlyValue>
            </ReadOnlyGroup>
          </Section>

          {/* 에러 메시지 */}
          {error && <ErrorAlert>{error}</ErrorAlert>}

          {/* 버튼 그룹 */}
          <ButtonGroup>
            <CancelButton type="button" onClick={handleCancel}>
              취소
            </CancelButton>
            <SaveButton type="submit" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </SaveButton>
          </ButtonGroup>
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
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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

export default ProfileEditPage;
