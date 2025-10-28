import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

const MAX_LENGTH = 300; // 최대 표시할 글자 수

// "더보기" 버튼 스타일
const MoreButton = styled.button`
  background: none;
  border: none;
  color: #6a0dad; /* 보라색 */
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: 5px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

// 텍스트 내용 컨테이너
const ContentWrapper = styled.div`
  line-height: 1.6;
  color: #333;
  font-size: 0.95rem;
  white-space: pre-wrap; /* 줄바꿈 유지 */
`;

// 컴포넌트 Props 타입
export type ExpandableTextProps = {
  content?: string; // 내용이 없으면 렌더링하지 않음
};

/**
 * 긴 텍스트 내용을 특정 길이(MAX_LENGTH)로 자르고
 * "더보기" 기능을 제공하는 컴포넌트 (TypeScript)
 */
const ExpandableText: React.FC<ExpandableTextProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // 훅 1번

  // --- 👇 1. 모든 훅 호출을 위로 옮깁니다 ---
  
  // 텍스트 내용이 최대 길이를 초과하는지 확인 (content가 null/undefined일 수 있음)
  const needsExpansion = content ? content.length > MAX_LENGTH : false;

  // 표시할 텍스트 계산 (useMemo)
  const displayedText = useMemo(() => {
    // content가 없을 경우 빈 문자열 반환
    if (!content) return ''; 
    
    // 이전 로직과 동일
    return needsExpansion && !isExpanded
      ? content.substring(0, MAX_LENGTH) + '...'
      : content;
  }, [content, isExpanded, needsExpansion]); // 훅 2번
  
  // --- 👆 훅 호출 끝 ---

  // --- 👇 2. 조건부 return은 모든 훅 호출 이후에 ---
  // 내용이 없으면 아무 것도 렌더링하지 않음
  if (!content) return null; 
  // --- 👆 ---

  return (
    <ContentWrapper>
      {displayedText}
      {needsExpansion && (
        <MoreButton
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? '접기' : '더보기'}
        </MoreButton>
      )}
    </ContentWrapper>
  );
};

export default ExpandableText;