import React, { useState } from 'react';
import reviewsData from '../data/reviews.json';
import eventDetail from '../data/eventDetailData.json';
import MapComponent from '../component/common/MapComponent.jsx'; 
import ExpandableText from '../component/common/ExpandableText.jsx'; // 👈 ExpandableText 임포트!
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
    ReviewRating
} from '../styles/EventDetail.styles.js';

// 임시 이미지 데이터
const images = eventDetail.images;

// 행사 정보 리스트를 2열로 나누는 함수
const splitInfoList = (info) => {
    const half = Math.ceil(info.length / 2);
    return {
        left: info.slice(0, half),
        right: info.slice(half)
    };
};
const infoColumns = splitInfoList(eventDetail.info);

// 이벤트 주소 찾기
const eventAddressItem = eventDetail.info.find(i => i.label === '주소');
const eventAddress = eventAddressItem ? eventAddressItem.value : '서울특별시 강남구';

function EventDetail() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    return (
        <DetailContainer>
            {/* 1. 이벤트 제목 및 요약 */}
            <EventHeader>
                <EventTitle>{eventDetail.title}</EventTitle>
                <EventLocation>
                    {eventDetail.locationArea} {eventDetail.info.find(i => i.label === '시작일').value} ~ {eventDetail.info.find(i => i.label === '종료일').value}
                </EventLocation>
                <EventSummary>{eventDetail.summary}</EventSummary>
            </EventHeader>

            {/* 2. 이미지 캐러셀 */}
            <ImageCarousel>
                <CarouselButton $direction="left" onClick={prevImage}>{'<'}</CarouselButton>
                <ImageWrapper>
                    {/* 실제 이미지 컴포넌트가 들어갈 위치 */}
                    <Placeholder>이미지 {currentImageIndex + 1}</Placeholder>
                </ImageWrapper>
                <CarouselButton $direction="right" onClick={nextImage}>{'>'}</CarouselButton>
                <DotContainer>
                    {images.map((_, index) => (
                        <Dot
                            key={index}
                            $active={index === currentImageIndex}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </DotContainer>
            </ImageCarousel>

            {/* 3. 상세 정보 */}
            <SectionTitle>상세 정보</SectionTitle>
            <ContentBlock>
                {/* 🚀 이 부분을 ExpandableText로 대체 */}
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
                                {item.isLink ?
                                    <a href={item.value} target="_blank" rel="noopener noreferrer">{item.value}</a> :
                                    item.value}
                            </li>
                        ))}
                    </InfoList>

                    {/* [우측 열 정보] */}
                    <InfoList>
                        {infoColumns.right.map((item) => (
                            <li key={item.label}>
                                <span>{item.label}:</span>
                                {item.isLink ?
                                    <a href={item.value} target="_blank" rel="noopener noreferrer">{item.value}</a> :
                                    item.value}
                            </li>
                        ))}
                    </InfoList>
                </InfoGridContainer>

            </MapInfoSection>

            {/* 5. 리뷰 섹션 */}
            <SectionTitle>리뷰</SectionTitle>
            <ReviewHeader>
                <ReviewStats>
                    <p>평점 <span>{eventDetail.reviewStats.rating}점</span></p>
                    <p>총 <span>{reviewsData.length}개</span></p>
                </ReviewStats>
                <ReviewWriteButton>글쓰기</ReviewWriteButton>
            </ReviewHeader>

            <ReviewGrid>
                {reviewsData.map((review) => (
                    <ReviewCard key={review.id}>
                        <ReviewRating>{renderStars(review.rating)}</ReviewRating>
                        <ReviewUser>{review.user}</ReviewUser>
                        <ReviewDate>{review.date}</ReviewDate>
                        <ReviewText>{review.text}</ReviewText>
                    </ReviewCard>
                ))}
            </ReviewGrid>

        </DetailContainer>
    );
}

export default EventDetail;