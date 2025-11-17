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
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    margin: 0;
    padding-bottom: 5px;
`;

export const EventLocation = styled.p`
    color: #888;
    font-size: 1rem;
    margin: 5px 0 10px;
`;

export const EventSummary = styled.h3`
    /* 텍스트 내용의 너비만큼만 영역을 차지하도록 합니다. (인라인 요소) */
    display: inline-block; 
    
    font-size: 1.3rem;
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

export const CarouselButton = styled.button<{ $direction: 'left' | 'right' }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    color: #333;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 55px;
    font-size: 2rem;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: #afafafff;
      transition: color 0.2s ease;
    }
    
    ${(props) => (props.$direction === 'left' ? 'left: 10px;' : 'right: 10px;')}
`;

export const DotContainer = styled.div`
    position: absolute;
    bottom: 10px;
    display: flex;
    gap: 8px;
`;

export const Dot = styled.span<{ $active?: boolean }>`
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
    padding: 10px 0;
    
    @media (max-width: 600px) {
      /* 모바일에서는 1단으로 다시 변경 */
      grid-template-columns: 1fr;
    }
`;

export const InfoList = styled.ul`
  width: 90%;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    line-height: 1.6;
    color: #444;

    /* 한 줄 유지 + 텍스트 잘림 방지 */
    align-items: center;
    white-space: break-word; 
    /* span(레이블)과 값 사이 간격 고정 */
    span {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 1.2rem;
      color: #333;
      flex-shrink: 0; /* 라벨은 줄어들지 않게 */
    }

    /*값 텍스트는 가능한 한 줄로 */
    p, div {
      padding-left: 1rem;
      font-size: 1.1rem;
      font-weight: 400;
      flex: 1;
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
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
`;

export const ReviewCard = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 23.1837px;
  gap: 10px;

  width: 320px;
  min-width: 231.84px; 
  height: 200px;
  
  background: #FFFFFF;
  border: 0.965986px solid #D9D9D9; 
  border-radius: 7.79734px;

  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; // 호버 효과
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  position: relative; // 버튼 절대 위치 기준
  padding-bottom: 40px; 
`;

// --- ReviewCard 내부 요소 스타일 ---

export const ReviewTitle = styled.h4` // 제목 스타일 추가 (이미지 참고)
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  white-space: nowrap; // 한 줄로 표시
  overflow: hidden; // 넘치면 숨김
  text-overflow: ellipsis; // 넘치면 ...으로 표시
  width: 100%; // 부모 너비에 맞춤
`;

export const ReviewText = styled.p`
  font-size: 0.9rem;
  color: #555;
  margin: 0;
  line-height: 1.4;
  flex-grow: 1; // 남은 공간 차지 (내용이 길 때)
  overflow: hidden; // 넘치는 텍스트 숨김
  text-overflow: ellipsis; // ... 처리
  display: -webkit-box; // 여러 줄 말줄임
  -webkit-line-clamp: 2; // 표시할 줄 수 (이미지상 2줄 정도)
  -webkit-box-orient: vertical;
  width: 100%;
`;

export const ReviewImageGrid = styled.div` // 이미지들을 담을 컨테이너 추가
  display: flex;
  gap: 8px;
  margin-top: auto; // 하단으로 밀어냄 (ReviewCard의 flex-direction: column)
`;

export const ReviewThumbnail = styled.img` // ReviewCard 내 썸네일 이미지 스타일
  width: 60px; // 이미지 크기
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f0f0f0; // 이미지 없을 때 배경
`;

export const ReviewImagePlaceholder = styled.div` // 썸네일 플레이스홀더
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  font-size: 1.5rem;
`;

export const ReviewFooter = styled.div` // 하단 사용자 정보와 별점 컨테이너
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 10px; // 상단 요소와의 간격
`;

export const UserInfoWrapper = styled.div` // 사용자 이미지, 이름, 날짜
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UserProfileImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee;
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const ReviewUser = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
`;

export const ReviewDate = styled.span`
  font-size: 0.75rem;
  color: #888;
`;

export const ReviewRating = styled.div` // 별점 스타일
  font-size: 1rem; // 별 크기
  color: #FFC107; // 별 색상
  white-space: nowrap;
`;


export const ReviewActions = styled.div`
  position: absolute;
  bottom: 15px; // 카드 하단에서의 위치
  right: 20px; // 카드 오른쪽에서의 위치
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button<{ danger?: boolean }>` 
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 0.8rem;
  /* danger prop에 따라 색상 변경 */
  color: ${props => props.danger ? '#ff4d4f' : '#888'}; 
  cursor: pointer;

  &:hover {
    /* danger prop에 따라 호버 색상 변경 */
    color: ${props => props.danger ? '#d9363e' : '#333'};
    text-decoration: underline;
  }
`;

// 이미지 위 버튼들을 담는 그룹
export const ImageActionGroup = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 3px;
  justify-content: right;

  button {
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    transition: transform 0.15s;

    &:hover {
      transform: scale(1.1);
    }

    &:focus { outline : none; }
  }
`;

// 태그 리스트
export const TagInfoList = styled.ul`
  width: 90%;
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;                 /* 핵심 */
    align-items: flex-start;       /* 위쪽 정렬 (칩 여러 줄 대비) */
    gap: 12px;
    padding: 6px 0;
    color: #444;

    span {
      min-width: 60px;             /* 라벨 고정 폭 */
      font-weight: 600;
      font-size: 1.2rem;
      color: #333;
      white-space: nowrap;         /* '태그' 줄바꿈 방지 */
      flex-shrink: 0;
      line-height: 1.8;
      display: flex;
      align-items: center;
    }
  }
`;

/* 태그 래퍼 */
export const TagsWrap = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;     /* 줄바꿈 허용 */
  gap: 8px;            /* 칩 간격 */
`;

/* 태그 칩 */
export const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 0.9rem !important;
  line-height: 1;             /* 세로 가운데 */
  background-color: #f1f3f5;
  color: #495057;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color .15s ease, transform .05s ease;

  &:hover { background-color: #e9ecef; }
  &:active { transform: scale(0.98); }
`;