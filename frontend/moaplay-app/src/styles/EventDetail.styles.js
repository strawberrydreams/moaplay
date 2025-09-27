import styled from 'styled-components';

// 메인 상세 페이지 컨테이너
export const DetailContainer = styled.div`
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Noto Sans KR', sans-serif;
`;

// 이벤트 상단 정보 (제목, 지역, 한 줄 소개)
export const EventHeader = styled.div`
    text-align: center;
    padding-bottom: 20px;
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
`;

export const EventTitle = styled.h2`
    font-size: 2.2rem;
    font-weight: 700;
    color: #333;
    margin: 0;
    padding-bottom: 5px;
`;

export const EventLocation = styled.p`
    color: #888;
    font-size: 0.9rem;
    margin: 5px 0 10px;
`;

export const EventSummary = styled.h3`
    /* 텍스트 내용의 너비만큼만 영역을 차지하도록 합니다. (인라인 요소) */
    display: inline-block; 
    
    font-size: 1.2rem;
    font-weight: 500;
    color: #555;
    margin-top: 20px; 
    margin-bottom: 20px; 
    
    /* 실제 밑줄을 그리기 위한 가상 요소 ::after */
    &::after {
        content: '';
        display: block;
        /* width: 100%;를 사용하여 부모 요소(텍스트 컨테이너)의 너비와 동일하게 설정 */
        width: 100%; 
        /* 밑줄의 두께 */
        height: 4px; 
        background-color: #FFC18B; /* 보라색 계열의 선 색상 */
        /* 텍스트 아래 5px 간격, auto를 사용하여 중앙 정렬 효과 유지 */
        margin: 5px auto 0 auto; 
    }
`;

// 이미지 캐러셀 컨테이너
export const ImageCarousel = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
`;

export const ImageWrapper = styled.div`
    width: 100%;
    max-width: 700px; /* 이미지 영역 너비 */
    height: 400px; /* 이미지 영역 높이 */
    background-color: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Placeholder = styled.div`
    color: #999;
    font-size: 1.5rem;
`;

export const CarouselButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.4);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 10;
    
    &:hover {
        background: rgba(0, 0, 0, 0.6);
    }
    
    ${(props) => (props.$direction === 'left' ? 'left: 10px;' : 'right: 10px;')}
`;

export const DotContainer = styled.div`
    position: absolute;
    bottom: 10px;
    display: flex;
    gap: 8px;
`;

export const Dot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(props) => (props.$active ? '#6a0dad' : '#cccccc')};
    cursor: pointer;
`;

// 상세 정보 컨테이너
export const SectionTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    border-bottom: 2px solid #6a0dad;
    padding-bottom: 10px;
    margin-bottom: 20px;
`;

export const ContentBlock = styled.div`
    line-height: 1.8;
    color: #444;
    margin-bottom: 40px;
`;

// 지도 및 정보 섹션 (수정됨: 지도와 정보 그리드가 세로로 쌓이도록 함)
export const MapInfoSection = styled.div`
    display: block; 
    margin-bottom: 40px;
`;

export const MapContainer = styled.div`
    width: 100%; /* 너비를 100%로 설정하여 한 줄을 모두 차지 */
    height: 300px;
    background-color: #ddd;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px; /* 지도와 정보 그리드 사이에 간격 추가 */
`;

// InfoList를 2단으로 감싸는 컨테이너 (새로 추가)
export const InfoGridContainer = styled.div`
    display: grid;
    /* 2개의 컬럼으로 나누고, 간격은 30px */
    grid-template-columns: repeat(2, 1fr); 
    gap: 30px;
    padding: 20px 0;
    
    @media (max-width: 600px) {
        /* 모바일에서는 1단으로 다시 변경 */
        grid-template-columns: 1fr;
    }
`;

export const InfoList = styled.ul`
    width: 100%; /* 너비를 100%로 설정하여 Grid 컨테이너의 항목이 됨 */
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
        line-height: 1.6;
        margin-bottom: 10px;
        color: #444;
        
        span {
            font-weight: 600;
            margin-right: 10px;
            color: #333;
        }
    }
`;

// 리뷰 섹션
export const ReviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 20px;
`;

export const ReviewStats = styled.div`
    display: flex;
    gap: 15px;
    color: #555;
    
    span {
        font-weight: 600;
        color: #333;
    }
`;

export const ReviewWriteButton = styled.button`
    background-color: #6a0dad;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #510793;
    }
`;

export const ReviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
`;

export const ReviewCard = styled.div`
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const ReviewUser = styled.div`
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
`;

export const ReviewDate = styled.p`
    font-size: 0.75rem;
    color: #999;
    margin: 0 0 10px;
`;

export const ReviewText = styled.p`
    font-size: 0.9rem;
    color: #444;
    line-height: 1.4;
`;

export const ReviewRating = styled.div`
    color: gold;
    font-size: 1.2rem;
`;
