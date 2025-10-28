/**
 * 주최자 인증 페이지 컴포넌트
 *
 * 사용자가 주최자 권한을 신청하는 페이지입니다.
 * 공식 이메일, 연락처, 사업자등록번호, 회사명, 서류 업로드 기능을 제공합니다.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks';
import { OrganizerService } from '../services/organizerService';
import { ErrorHandler } from '../utils/error';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Button } from '../components/common';
import { FormInput } from '../components/common';
import { Loading } from '../components/common';

interface OrganizerAuthData {
  officialEmail: string;
  contactNumber: string;
  businessNumber: string;
  companyName: string;
  documents: File[];
}

interface ApplicationStatus {
  has_application: boolean;
  application?: {
    id: number;
    status: string;
    official_email: string;
    contact_number: string;
    company_name?: string;
    created_at?: string;
    rejection_reason?: string;
  };
  user_role: string;
  can_apply: boolean;
}

const HostAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);

  const [formData, setFormData] = useState<OrganizerAuthData>({
    officialEmail: '',
    contactNumber: '',
    businessNumber: '',
    companyName: '',
    documents: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadApplicationStatus();
  }, [isAuthenticated, navigate]);

  /**
   * 현재 신청 상태를 조회합니다
   */
  const loadApplicationStatus = async () => {
    try {
      setLoading(true);
      const response = await OrganizerService.getApplicationStatus();
      setApplicationStatus(response.data);
    } catch (error: unknown) {
      ErrorHandler.handle(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 입력 필드 값 변경 처리
   */
  const handleInputChange = (field: keyof OrganizerAuthData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  /**
   * 파일 선택 처리
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // 파일 개수 제한 (최대 5개)
    if (formData.documents.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        documents: '최대 5개의 파일만 업로드할 수 있습니다.',
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));

    // 에러 메시지 제거
    if (errors.documents) {
      setErrors(prev => ({
        ...prev,
        documents: '',
      }));
    }
  };

  /**
   * 파일 제거 처리
   */
  const handleFileRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.officialEmail) {
      newErrors.officialEmail = '공식 이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)) {
      newErrors.officialEmail = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = '연락처를 입력해주세요.';
    } else if (!/^[0-9-+\s()]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = '올바른 연락처 형식을 입력해주세요.';
    }

    if (formData.businessNumber && !/^[0-9-]+$/.test(formData.businessNumber)) {
      newErrors.businessNumber = '올바른 사업자등록번호 형식을 입력해주세요.';
    }

    if (formData.documents.length === 0) {
      newErrors.documents = '최소 1개의 서류를 업로드해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 서류 파일 검증
   */
  const validateDocuments = (): void => {
    if (formData.documents.length === 0) return;

    formData.documents.forEach((doc, index) => {
      // 파일 크기 검증 (20MB)
      const maxSize = 20 * 1024 * 1024;
      if (doc.size > maxSize) {
        throw new Error(
          `문서 ${index + 1}의 크기가 너무 큽니다. 최대 20MB까지 업로드 가능합니다.`
        );
      }

      // 파일 형식 검증
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-hwp',
        'text/plain',
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.hwp', '.txt'];

      const isValidType =
        allowedTypes.includes(doc.type) ||
        allowedExtensions.some(ext => doc.name.toLowerCase().endsWith(ext));

      if (!isValidType) {
        throw new Error(
          `문서 ${index + 1}은(는) 지원하지 않는 형식입니다. PDF, DOC, DOCX, HWP, TXT 파일만 업로드 가능합니다.`
        );
      }
    });
  };

  /**
   * 신청 제출 처리
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setUploading(true);

      // 서류 파일 검증
      validateDocuments();

      // 신청 제출 (문서 파일 포함)
      const applicationData = {
        official_email: formData.officialEmail,
        contact_number: formData.contactNumber,
        business_number: formData.businessNumber || undefined,
        company_name: formData.companyName || undefined,
        document_urls: [], // multipart 방식에서는 빈 배열
      };

      await OrganizerService.applyOrganizer(
        applicationData,
        formData.documents
      );
      setUploading(false);

      // 성공 시 프로필 페이지로 이동
      navigate('/profile', {
        state: {
          message:
            '주최자 인증 신청이 완료되었습니다. 관리자 검토 후 결과를 알려드리겠습니다.',
        },
      });
    } catch (error: unknown) {
      ErrorHandler.handle(error);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  // 이미 주최자인 경우
  if (applicationStatus?.user_role === 'organizer') {
    return (
      <PageContainer>
        <Header />
        <ContentContainer>
          <StatusCard>
            <StatusIcon>✓</StatusIcon>
            <StatusTitle>주최자 인증 완료</StatusTitle>
            <StatusMessage>이미 주최자 권한을 가지고 있습니다.</StatusMessage>
            <Button onClick={() => navigate('/profile')}>
              프로필로 돌아가기
            </Button>
          </StatusCard>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // 신청 내역이 있는 경우
  if (applicationStatus?.has_application) {
    const { application } = applicationStatus;

    return (
      <PageContainer>
        <Header />
        <ContentContainer>
          <StatusCard>
            <StatusIcon status={application?.status}>
              {application?.status === 'pending'
                ? '⏳'
                : application?.status === 'approved'
                  ? '✓'
                  : '✗'}
            </StatusIcon>
            <StatusTitle>
              {application?.status === 'pending'
                ? '승인 대기 중'
                : application?.status === 'approved'
                  ? '승인 완료'
                  : '승인 거절'}
            </StatusTitle>
            <StatusMessage>
              {application?.status === 'pending'
                ? '관리자가 검토 중입니다. 결과를 기다려주세요.'
                : application?.status === 'approved'
                  ? '주최자 인증이 승인되었습니다.'
                  : `승인이 거절되었습니다: ${application?.rejection_reason}`}
            </StatusMessage>

            <ApplicationDetails>
              {application?.created_at && (
                <DetailItem>
                  <DetailLabel>신청일:</DetailLabel>
                  <DetailValue>
                    {new Date(application.created_at).toLocaleDateString()}
                  </DetailValue>
                </DetailItem>
              )}
              <DetailItem>
                <DetailLabel>공식 이메일:</DetailLabel>
                <DetailValue>{application?.official_email}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>연락처:</DetailLabel>
                <DetailValue>{application?.contact_number}</DetailValue>
              </DetailItem>
              {application?.company_name && (
                <DetailItem>
                  <DetailLabel>회사명:</DetailLabel>
                  <DetailValue>{application?.company_name}</DetailValue>
                </DetailItem>
              )}
            </ApplicationDetails>

            {application?.status === 'rejected' && (
              <Button onClick={() => setApplicationStatus(null)}>
                다시 신청하기
              </Button>
            )}

            <Button variant="secondary" onClick={() => navigate('/profile')}>
              프로필로 돌아가기
            </Button>
          </StatusCard>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  // 신청 폼
  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <FormCard>
          <FormTitle>주최자 인증 신청</FormTitle>
          <FormDescription>
            주최자 권한을 신청하려면 아래 정보를 입력하고 관련 서류를
            업로드해주세요.
          </FormDescription>

          <Form onSubmit={handleSubmit}>
            <FormInput
              label="공식 이메일 주소"
              type="email"
              value={formData.officialEmail}
              onChange={(value: string) => handleInputChange('officialEmail', value)}
              error={errors.officialEmail}
              placeholder="company@example.com"
              required
            />

            <FormInput
              label="연락처"
              type="tel"
              value={formData.contactNumber}
              onChange={(value: string) => handleInputChange('contactNumber', value)}
              error={errors.contactNumber}
              placeholder="010-1234-5678"
              required
            />

            <FormInput
              label="사업자등록번호 (선택사항)"
              type="text"
              value={formData.businessNumber}
              onChange={(value: string) => handleInputChange('businessNumber', value)}
              error={errors.businessNumber}
              placeholder="123-45-67890"
            />

            <FormInput
              label="회사명/단체명 (선택사항)"
              type="text"
              value={formData.companyName}
              onChange={(value: string) => handleInputChange('companyName', value)}
              error={errors.companyName}
              placeholder="회사명 또는 단체명"
            />

            <FileUploadSection>
              <FileUploadLabel>
                첨부 서류 <RequiredMark>*</RequiredMark>
              </FileUploadLabel>
              <FileUploadDescription>
                사업자등록증, 재직증명서, 신분증 등 주최자 자격을 증명할 수 있는
                서류를 업로드해주세요. (PDF, DOC, DOCX, HWP, TXT 형식, 최대
                16MB, 최대 5개 파일)
              </FileUploadDescription>

              <FileInput
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.hwp,.txt"
                onChange={handleFileSelect}
                id="documents"
              />
              <FileInputLabel htmlFor="documents">파일 선택</FileInputLabel>

              {formData.documents.length > 0 && (
                <FileList>
                  {formData.documents.map((file, index) => (
                    <FileItem key={index}>
                      <FileName>{file.name}</FileName>
                      <FileSize>
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </FileSize>
                      <RemoveButton
                        type="button"
                        onClick={() => handleFileRemove(index)}
                      >
                        ✗
                      </RemoveButton>
                    </FileItem>
                  ))}
                </FileList>
              )}

              {errors.documents && (
                <ErrorMessage>{errors.documents}</ErrorMessage>
              )}
            </FileUploadSection>

            <SubmitSection>
              <Button type="submit" disabled={submitting} loading={submitting}>
                {uploading
                  ? '서류 업로드 중...'
                  : submitting
                    ? '신청 중...'
                    : '인증 신청'}
              </Button>
            </SubmitSection>
          </Form>
        </FormCard>
      </ContentContainer>
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

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #f8f9fa;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 600px;
`;

const StatusCard = styled(FormCard)`
  text-align: center;
  max-width: 500px;
`;

const FormTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
`;

const FormDescription = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FileUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileUploadLabel = styled.label`
  font-weight: 500;
  color: #333;
`;

const RequiredMark = styled.span`
  color: #dc3545;
`;

const FileUploadDescription = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
  }
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const FileName = styled.span`
  flex: 1;
  font-size: 0.875rem;
`;

const FileSize = styled.span`
  font-size: 0.75rem;
  color: #666;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 2px;

  &:hover {
    background-color: #dc3545;
    color: white;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
`;

const SubmitSection = styled.div`
  margin-top: 1rem;
`;

const StatusIcon = styled.div<{ status?: string }>`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props =>
    props.status === 'approved'
      ? '#28a745'
      : props.status === 'rejected'
        ? '#dc3545'
        : '#ffc107'};
`;

const StatusTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

const StatusMessage = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const ApplicationDetails = styled.div`
  text-align: left;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  min-width: 100px;
  color: #333;
`;

const DetailValue = styled.span`
  color: #666;
`;

export default HostAuthPage;
