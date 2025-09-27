import React, { useState } from 'react';
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

/**
 * 긴 텍스트 내용을 특정 길이(385자)로 자르고
 * "더보기" 기능을 제공하는 컴포넌트
 * @param {string} content - 표시할 전체 텍스트 내용
 */
function ExpandableText({ content }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // 텍스트 내용이 최대 길이를 초과하는지 확인
    const needsExpansion = content.length > MAX_LENGTH;
    
    // 표시할 텍스트: 전체 내용 또는 잘린 내용
    const displayedText = needsExpansion && !isExpanded
        ? content.substring(0, MAX_LENGTH) + '...'
        : content;

    if (!content) return null;

    return (
        <ContentWrapper>
            {/* 텍스트 내용 */}
            {displayedText}
            
            {/* 더보기/접기 버튼 */}
            {needsExpansion && (
                <MoreButton onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? '접기' : '더보기'}
                </MoreButton>
            )}
        </ContentWrapper>
    );
}

export default ExpandableText;
