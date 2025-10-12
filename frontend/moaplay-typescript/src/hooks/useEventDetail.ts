import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getEventById } from '../service/eventsApi';
import { normalizeEventDetail, splitInfoList } from '../normalizers/eventNormalizer';
import { normalizeError, toUserMessage } from '../utils/error';
import type { EventDetailData } from '../types/eventDetail';

export const useEventDetail = () => {
    const {id} = useParams<{ id: string }>();
    const [eventDetail, setEventDetail] = useState<EventDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    // 라우트 변경 시 즉시 초기화 (useEffect 외부)
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [id]);

    useEffect(() => {
        // id가 없으면 아무 작업도 하지 않음
        if (!id) {
            setError('유효하지 않은 이벤트 ID입니다.');
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const rawData = await getEventById(id, controller.signal);
                const normalized = normalizeEventDetail(rawData);
                setEventDetail(normalized);
            } catch (e) {
                const normalizedError = normalizeError(e);
                // 취소된 요청은 에러로 표시하지 않음
                if (!normalizedError.isCanceled) {
                    setError(toUserMessage(normalizedError));
                }
            } finally {
                setLoading(false);
            }
        };

        load();

        return () => controller.abort();
    }, [id]);

    // 파생 상태 (Derived State)
    const images = useMemo<string[]>(
        () => eventDetail?.images ?? [],
        [eventDetail?.images]
    );

    const infoColumns = useMemo(
        () => splitInfoList(eventDetail?.info ?? []),
        [eventDetail?.info]
    );

    const eventAddress = useMemo(() => {
        const item = eventDetail?.info?.find((i) => i.label === '주소');
        return item?.value ?? null; // 기본값은 null로, UI에서 처리
    }, [eventDetail?.info]);

    // 이벤트 핸들러
    const nextImage = (): void => {
        if (images.length === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (): void => {
        if (images.length === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToImage = (index: number): void => {
        if (index >= 0 && index < images.length) {
            setCurrentImageIndex(index);
        }
    };

    // 컴포넌트에게 필요한 모든 상태와 함수를 반환
    return {
        loading,
        error,
        eventDetail,
        images,
        infoColumns,
        eventAddress,
        currentImageIndex,
        nextImage,
        prevImage,
        goToImage, // 추가: 특정 이미지로 직접 이동
        hasImages: images.length > 0, // 추가: 이미지 존재 여부
    };
};