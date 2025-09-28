import React, { useMemo, useState } from 'react';
import eventDetailJson from '../../data/eventDetailData.json';
import MapComponent from '../../components/common/MapComponent';
import ExpandableText from '../../components/common/ExpandableText';
import {
      DetailContainer,
      EventHeader,
      EventTitle,
      EventLocation,
      EventSummary,
      ImageCarousel,
      ImageWrapper,
      Placeholder,
      CarouselButton,
      DotContainer,
      Dot,
      SectionTitle,
      ContentBlock,
      MapInfoSection,
      MapContainer,
      InfoList,
      InfoGridContainer,
      ReviewHeader,
      ReviewStats,
      ReviewWriteButton,
      ReviewGrid,
      ReviewCard,
      ReviewUser,
      ReviewDate,
      ReviewText,
      ReviewRating,
} from '../../styles/EventDetail.styles.ts';

// ===== Type Definitions =====
export type InfoItem = { label: string; value: string; isLink?: boolean };
export type EventDetailData = {
  id: number;
  title: string;
  locationArea: string;
  summary: string;
  images?: string[];
  description: string;
  info: InfoItem[];
  reviewStats: { rating: number; count?: number };
};

// JSON 타입 단언 (tsconfig에 resolveJsonModule 켜져 있어야 함)
const eventDetail = eventDetailJson as EventDetailData;

// 이미지 배열 (가드)
const images: string[] = Array.isArray(eventDetail.images) ? eventDetail.images : [];

// 행사 정보 리스트를 2열로 나누는 함수
const splitInfoList = (info: InfoItem[]): { left: InfoItem[]; right: InfoItem[] } => {
  const half = Math.ceil(info.length / 2);
  return {
    left: info.slice(0, half),
    right: info.slice(half),
  };
};

const EventDetail: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const infoColumns = useMemo(() => splitInfoList(eventDetail.info ?? []), []);

  // 이벤트 주소 찾기
  const eventAddress = useMemo(() => {
    const item = (eventDetail.info ?? []).find((i) => i.label === '주소');
    return item?.value ?? '서울특별시 강남구';
  }, []);

  const nextImage = (): void => {
    setCurrentImageIndex((prev) => (prev + 1) % (images.length || 1));
  };

  const prevImage = (): void => {
    setCurrentImageIndex((prev) => (prev - 1 + (images.length || 1)) % (images.length || 1));
  };

  const renderStars = (rating: number): string => {
    const r = Math.max(0, Math.min(5, Math.floor(rating)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  return (
    <DetailContainer>
      {/* 1. 이벤트 제목 및 요약 */}
      <EventHeader>
        <EventTitle>{eventDetail.title}</EventTitle>
        <EventLocation>
          {eventDetail.locationArea}{' '}
          {(eventDetail.info ?? []).find((i) => i.label === '시작일')?.value ?? ''} ~{' '}
          {(eventDetail.info ?? []).find((i) => i.label === '종료일')?.value ?? ''}
        </EventLocation>
        <EventSummary>{eventDetail.summary}</EventSummary>
      </EventHeader>

      {/* 2. 이미지 캐러셀 */}
      <ImageCarousel>
        <CarouselButton $direction="left" onClick={prevImage} aria-label="previous image">
          {'<'}
        </CarouselButton>
        <ImageWrapper>
          {/* 실제 이미지가 있다면 img, 아니면 Placeholder */}
          {images.length > 0 ? (
            <img src={images[currentImageIndex]} alt={`event image ${currentImageIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Placeholder>이미지 {currentImageIndex + 1}</Placeholder>
          )}
        </ImageWrapper>
        <CarouselButton $direction="right" onClick={nextImage} aria-label="next image">
          {'>'}
        </CarouselButton>
        <DotContainer>
          {(images.length > 0 ? images : new Array(1).fill('')).map((_, index) => (
            <Dot key={index} $active={index === currentImageIndex} onClick={() => setCurrentImageIndex(index)} />
          ))}
        </DotContainer>
      </ImageCarousel>

      {/* 3. 상세 정보 */}
      <SectionTitle>상세 정보</SectionTitle>
      <ContentBlock>
        <ExpandableText content={eventDetail.description} />
      </ContentBlock>

      {/* 4. 지도 및 일정 정보 섹션 */}
      <MapInfoSection>
        {/* 1. 지도 컨테이너 */}
        <MapContainer>
          <MapComponent address={eventAddress} />
        </MapContainer>

        {/* 2. 정보 그리드 컨테이너 (2단 레이아웃) */}
        <InfoGridContainer>
          {/* [좌측 열 정보] */}
          <InfoList>
            {infoColumns.left.map((item) => (
              <li key={item.label}>
                <span>{item.label}:</span>
                {item.isLink ? (
                  <a href={item.value} target="_blank" rel="noopener noreferrer">
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </li>
            ))}
          </InfoList>

          {/* [우측 열 정보] */}
          <InfoList>
            {infoColumns.right.map((item) => (
              <li key={item.label}>
                <span>{item.label}:</span>
                {item.isLink ? (
                  <a href={item.value} target="_blank" rel="noopener noreferrer">
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </li>
            ))}
          </InfoList>
        </InfoGridContainer>
      </MapInfoSection>

      {/* 5. 리뷰 섹션 (집계만 표시) */}
      <SectionTitle>리뷰</SectionTitle>
      <ReviewHeader>
        <ReviewStats>
          <p>
            평점 <span>{eventDetail.reviewStats?.rating ?? 0}점</span>
          </p>
          <p>
            총 <span>{eventDetail.reviewStats?.count ?? 0}개</span>
          </p>
        </ReviewStats>
        <ReviewWriteButton>글쓰기</ReviewWriteButton>
      </ReviewHeader>

      {/* 리뷰 카드가 별도 데이터로 들어오면 여기에 map으로 렌더링 */}
      <ReviewGrid>
        {/* 예시 placeholder */}
        <ReviewCard>
          <ReviewRating>{renderStars(eventDetail.reviewStats?.rating ?? 0)}</ReviewRating>
          <ReviewUser>예시 사용자</ReviewUser>
          <ReviewDate>2025-04-25</ReviewDate>
          <ReviewText>첫 번째 리뷰를 여기에 렌더링하세요.</ReviewText>
        </ReviewCard>
      </ReviewGrid>
    </DetailContainer>
  );
};

export default EventDetail;