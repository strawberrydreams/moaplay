import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { startCrawling } from '../../services/eventsApi';
import type { EventSourceProvider, StartCrawlingPayload } from '../../types/events';

// 크롤링 모달 Props
interface CrawlingEventsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // 크롤링으로 신규 행사가 추가된 뒤 상위 컴포넌트에 알려주고 싶으면 사용
    onCrawlingCompleted?: () => void;
}

// 백엔드에서 돌아올 것으로 기대하는 응답 타입
// TODO: 백엔드 API에 맞게 조정
interface CrawlingResult {
    provider: EventSourceProvider;
    created_count: number; // 새로 추가된 행사 개수
}

// 크롤링 조건 설정 + 결과 표시 모달
export const CrawlingEventsModal: React.FC<CrawlingEventsModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onCrawlingCompleted,
                                                                        }) => {
    const [provider, setProvider] = useState<EventSourceProvider>('NAVER');
    const [category, setCategory] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState('1');
    const [limit, setLimit] = useState('10');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CrawlingResult | null>(null);

    // 모달 열릴 때마다 폼/상태 초기화
    useEffect(() => {
        if (isOpen) {
            setProvider('NAVER');
            setCategory('');
            setDateFrom('');
            setDateTo('');
            setKeyword('');
            setPage('1');
            setLimit('10');
            setLoading(false);
            setError(null);
            setResult(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (!dateFrom || !dateTo || !page || !limit) {
            setError('시작일, 종료일, 시작 페이지, 최대 개수/페이지 수를 모두 입력해주세요.');
            return;
        }

        setLoading(true);

        const payload: StartCrawlingPayload = {
            provider,
            category: category || undefined,
            date_from: dateFrom,
            date_to: dateTo,
            keyword: keyword || undefined,
            page: Number(page),
            limit: Number(limit),
        };

        try {
            const response = await startCrawling(payload);

            // startCrawling 이 axiosInstance.post 를 그대로 리턴한다고 가정
            const data: any = (response as any).data ?? response;

            const providerFromServer = (data?.provider ?? provider) as EventSourceProvider;
            const createdCount =
                data?.created_count ??
                data?.createdCount ??
                data?.count ??
                0;

            const normalizedResult: CrawlingResult = {
                provider: providerFromServer,
                created_count: createdCount,
            };

            setResult(normalizedResult);
            onCrawlingCompleted?.();
        } catch (err) {
            console.error('크롤링 요청 실패:', err);
            setError('크롤링 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <h2>행사 데이터 크롤링</h2>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>

                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormRow>
                            <FormGroup>
                                <Label>크롤링 대상 사이트</Label>
                                <Select
                                    value={provider}
                                    onChange={(e) =>
                                        setProvider(e.target.value as EventSourceProvider)
                                    }
                                >
                                    <option value="NAVER">NAVER</option>
                                    <option value="YES24">YES24</option>
                                    <option value="INTERPARK">INTERPARK</option>
                                    <option value="TICKETLINK">TICKETLINK</option>
                                    <option value="LOCAL_GOV">LOCAL_GOV</option>
                                    <option value="ETC">기타(ETC)</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>카테고리 (선택)</Label>
                                <Input
                                    type="text"
                                    placeholder="예: 공연, 전시, 축제..."
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label>시작일 (선택)</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>종료일 (선택)</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    required
                                />
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label>검색어 (선택)</Label>
                                <Input
                                    type="text"
                                    placeholder="사이트에서 지원하는 경우에만 사용"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </FormGroup>
                        </FormRow>

                        <FormRow>
                            <FormGroup>
                                <Label>시작 페이지 (선택)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={page}
                                    onChange={(e) => setPage(e.target.value)}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>최대 개수 / 페이지 수 (선택)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    required
                                />
                            </FormGroup>
                        </FormRow>

                        <Actions>
                            <PrimaryButton type="submit" disabled={loading}>
                                {loading ? '크롤링 중...' : '크롤링 시작'}
                            </PrimaryButton>
                        </Actions>
                    </Form>

                    {loading && <InfoMessage>선택한 조건으로 크롤링을 실행 중입니다...</InfoMessage>}

                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    {result && !error && !loading && (
                        <SuccessMessage>
                            <strong>{result.provider}</strong> 사이트에서{' '}
                            <strong>{result.created_count}</strong>개의 행사 데이터가
                            크롤링되어 신규 행사로 추가되었습니다.
                        </SuccessMessage>
                    )}
                </ModalBody>
            </ModalContent>
        </ModalOverlay>
    );
};

// ===== 스타일 컴포넌트들 (ApprovedEventsModal 과 유사하게 구성) =====

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;

    h2 {
        margin: 0;
        color: #333;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;

    &:hover {
        color: #333;
    }
`;

const ModalBody = styled.div`
    padding: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const FormRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
`;

const FormGroup = styled.div`
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    font-size: 0.875rem;
    color: #555;
    margin-bottom: 0.25rem;
`;

const Input = styled.input`
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    border: 1px solid #ced4da;
    font-size: 0.875rem;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
    }
`;

const Select = styled.select`
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    border: 1px solid #ced4da;
    font-size: 0.875rem;
    background-color: #fff;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
    }
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
`;

const PrimaryButton = styled.button`
    padding: 0.5rem 1.25rem;
    border-radius: 4px;
    border: none;
    background-color: #007bff;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background-color: #0056b3;
    }
`;

const InfoMessage = styled.div`
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #e9f5ff;
    color: #0c5460;
    border-radius: 4px;
    font-size: 0.875rem;
`;

const ErrorMessage = styled.div`
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
    margin-top: 1rem;
    padding: 0.75rem;
    background-color: #d4edda;
    color: #155724;
    border-radius: 4px;
    font-size: 0.875rem;

    strong {
        font-weight: 600;
    }
`;