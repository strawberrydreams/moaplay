/**
 * 주최자 인증 대기 목록 모달 컴포넌트
 * 
 * 관리자가 승인 대기 중인 주최자 인증 신청을 확인하고 승인/거절할 수 있는 모달입니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { OrganizerService, OrganizerApplication } from '../../services/organizerService';
import { ErrorHandler } from '../../utils/error';
import { Button } from '../common';
import { Loading } from '../common';

interface PendingOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationProcessed?: () => void;
}

const PendingOrganizerModal: React.FC<PendingOrganizerModalProps> = ({
  isOpen,
  onClose,
  onApplicationProcessed
}) => {
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<OrganizerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPendingApplications();
    }
  }, [isOpen]);

  /**
   * 승인 대기 중인 신청 목록을 조회합니다
   */
  const loadPendingApplications = async () => {
    try {
      setLoading(true);
      const response = await OrganizerService.getApplications({ 
        status: 'pending',
        limit: 50 
      });
      setApplications(response.data.items);
    } catch (error) {
      ErrorHandler.handle(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 신청을 승인합니다
   */
  const handleApprove = async (application: OrganizerApplication) => {
    if (!confirm(`${application.user?.nickname}님의 주최자 인증을 승인하시겠습니까?`)) {
      return;
    }

    try {
      setProcessing(application.id);
      await OrganizerService.approveApplication(application.id);
      
      // 목록에서 제거
      setApplications(prev => prev.filter(app => app.id !== application.id));
      
      // 부모 컴포넌트에 알림
      onApplicationProcessed?.();
      
      alert('주최자 인증이 승인되었습니다.');
    } catch (error) {
      ErrorHandler.handle(error);
    } finally {
      setProcessing(null);
    }
  };

  /**
   * 거절 모달을 표시합니다
   */
  const showRejectDialog = (application: OrganizerApplication) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  /**
   * 신청을 거절합니다
   */
  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    try {
      setProcessing(selectedApplication.id);
      await OrganizerService.rejectApplication(selectedApplication.id, rejectionReason);
      
      // 목록에서 제거
      setApplications(prev => prev.filter(app => app.id !== selectedApplication.id));
      
      // 모달 닫기
      setShowRejectModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      
      // 부모 컴포넌트에 알림
      onApplicationProcessed?.();
      
      alert('주최자 인증이 거절되었습니다.');
    } catch (error) {
      ErrorHandler.handle(error);
    } finally {
      setProcessing(null);
    }
  };

  /**
   * 서류 링크를 새 창에서 엽니다
   */
  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>주최자 인증 승인 대기 목록</ModalTitle>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </ModalHeader>

          <ModalBody>
            {loading ? (
              <LoadingContainer>
                <Loading />
              </LoadingContainer>
            ) : applications.length === 0 ? (
              <EmptyMessage>승인 대기 중인 신청이 없습니다.</EmptyMessage>
            ) : (
              <ApplicationList>
                {applications.map((application) => (
                  <ApplicationCard key={application.id}>
                    <ApplicationHeader>
                      <UserInfo>
                        <UserName>{application.user?.nickname}</UserName>
                        <UserEmail>{application.user?.email}</UserEmail>
                      </UserInfo>
                      <ApplicationDate>
                        {new Date(application.created_at).toLocaleDateString()}
                      </ApplicationDate>
                    </ApplicationHeader>

                    <ApplicationDetails>
                      <DetailRow>
                        <DetailLabel>공식 이메일:</DetailLabel>
                        <DetailValue>{application.official_email}</DetailValue>
                      </DetailRow>
                      <DetailRow>
                        <DetailLabel>연락처:</DetailLabel>
                        <DetailValue>{application.contact_number}</DetailValue>
                      </DetailRow>
                      {application.business_number && (
                        <DetailRow>
                          <DetailLabel>사업자등록번호:</DetailLabel>
                          <DetailValue>{application.business_number}</DetailValue>
                        </DetailRow>
                      )}
                      {application.company_name && (
                        <DetailRow>
                          <DetailLabel>회사명:</DetailLabel>
                          <DetailValue>{application.company_name}</DetailValue>
                        </DetailRow>
                      )}
                    </ApplicationDetails>

                    {application.document_urls && application.document_urls.length > 0 && (
                      <DocumentSection>
                        <DocumentLabel>첨부 서류:</DocumentLabel>
                        <DocumentList>
                          {application.document_urls.map((url, index) => (
                            <DocumentItem key={index}>
                              <DocumentLink onClick={() => openDocument(url)}>
                                서류 {index + 1}
                              </DocumentLink>
                            </DocumentItem>
                          ))}
                        </DocumentList>
                      </DocumentSection>
                    )}

                    <ActionButtons>
                      <Button
                        variant="success"
                        size="small"
                        onClick={() => handleApprove(application)}
                        disabled={processing === application.id}
                        loading={processing === application.id}
                      >
                        승인
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => showRejectDialog(application)}
                        disabled={processing === application.id}
                      >
                        거절
                      </Button>
                    </ActionButtons>
                  </ApplicationCard>
                ))}
              </ApplicationList>
            )}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>

      {/* 거절 사유 입력 모달 */}
      {showRejectModal && (
        <ModalOverlay onClick={() => setShowRejectModal(false)}>
          <RejectModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>거절 사유 입력</ModalTitle>
              <CloseButton onClick={() => setShowRejectModal(false)}>✕</CloseButton>
            </ModalHeader>
            
            <RejectModalBody>
              <RejectMessage>
                {selectedApplication?.user?.nickname}님의 주최자 인증을 거절하는 사유를 입력해주세요.
              </RejectMessage>
              
              <RejectTextArea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="거절 사유를 입력해주세요..."
                rows={4}
              />
              
              <RejectActions>
                <Button
                  variant="secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  취소
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || processing === selectedApplication?.id}
                  loading={processing === selectedApplication?.id}
                >
                  거절
                </Button>
              </RejectActions>
            </RejectModalBody>
          </RejectModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

// 스타일 컴포넌트들
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const RejectModalContent = styled(ModalContent)`
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
`;

const ApplicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ApplicationCard = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
`;

const ApplicationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
`;

const UserEmail = styled.div`
  color: #666;
  font-size: 0.875rem;
`;

const ApplicationDate = styled.div`
  color: #666;
  font-size: 0.875rem;
`;

const ApplicationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  min-width: 120px;
  color: #333;
`;

const DetailValue = styled.span`
  color: #666;
`;

const DocumentSection = styled.div`
  margin-bottom: 1rem;
`;

const DocumentLabel = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
`;

const DocumentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DocumentItem = styled.div``;

const DocumentLink = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: #0056b3;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const RejectModalBody = styled.div`
  padding: 1.5rem;
`;

const RejectMessage = styled.p`
  margin-bottom: 1rem;
  color: #333;
  line-height: 1.5;
`;

const RejectTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const RejectActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

export default PendingOrganizerModal;