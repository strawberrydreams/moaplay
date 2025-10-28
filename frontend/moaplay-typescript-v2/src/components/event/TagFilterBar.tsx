/**
 * 태그 필터 바 컴포넌트
 * 
 * 태그 검색창을 제공하여 사용자가 태그로 행사를 필터링할 수 있습니다.
 */

import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * 태그 정보 타입
 */
export interface TagInfo {
  name: string;
  count?: number;
}

/**
 * TagFilterBar 컴포넌트 Props
 */
interface TagFilterBarProps {
  tags?: string[]; // 사용하지 않지만 호환성을 위해 유지
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  showClearButton?: boolean;
  maxVisibleTags?: number; // 사용하지 않지만 호환성을 위해 유지
  className?: string;
  onClearAll?: () => void;
}

/**
 * 태그 필터 바 컴포넌트
 * 
 * 검색창을 통해 태그를 입력하면 해당 태그가 포함된 행사만 필터링됩니다.
 * 클라이언트 사이드에서 태그 매칭을 수행합니다.
 */
export const TagFilterBar: React.FC<TagFilterBarProps> = ({
                                                            selectedTags,
                                                            onTagSelect,
                                                            showClearButton = true,
                                                            className,
                                                            onClearAll
                                                          }) => {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 검색어 변경 처리
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 검색어가 있으면 해당 태그 선택
    if (query.trim()) {
      onTagSelect(query.trim());
    } else if (onClearAll) {
      // 검색어가 비어있으면 모든 필터 해제
      onClearAll();
    }
  };

  /**
   * 검색어 초기화
   */
  const handleClearSearch = () => {
    setSearchQuery('');
    if (onClearAll) {
      onClearAll();
    }
  };

  /**
   * Enter 키 처리
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onTagSelect(searchQuery.trim());
    }
  };

  const hasSelectedTags = selectedTags.length > 0;

  return (
    <FilterBarContainer className={className}>
      <FilterHeader>
        <FilterTitle>
          태그 검색
          {hasSelectedTags && (
            <SelectedCount>({selectedTags.length}개 선택)</SelectedCount>
          )}
        </FilterTitle>
        
        {showClearButton && hasSelectedTags && (
          <ClearButton onClick={handleClearSearch}>
            전체 해제
          </ClearButton>
        )}
      </FilterHeader>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="태그를 입력하세요 (예: 음악, 전시, 축제)"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
          aria-label="태그 검색"
        />
        {searchQuery && (
          <ClearSearchButton
            onClick={handleClearSearch}
            aria-label="검색어 지우기"
          >
            ✕
          </ClearSearchButton>
        )}
      </SearchContainer>

      {hasSelectedTags && (
        <SelectedTagsContainer>
          <SelectedTagsLabel>선택된 태그:</SelectedTagsLabel>
          <SelectedTagsList>
            {selectedTags.map((tag) => (
              <SelectedTag key={tag}>
                <TagIcon>#</TagIcon>
                <TagText>{tag}</TagText>
                <RemoveTagButton
                  onClick={() => onTagSelect(tag)}
                  aria-label={`${tag} 태그 제거`}
                >
                  ✕
                </RemoveTagButton>
              </SelectedTag>
            ))}
          </SelectedTagsList>
        </SelectedTagsContainer>
      )}

      {hasSelectedTags && (
        <SelectedTagsInfo>
          <InfoIcon>ℹ️</InfoIcon>
          <InfoText>
            선택된 태그가 포함된 행사만 표시됩니다.
          </InfoText>
        </SelectedTagsInfo>
      )}
    </FilterBarContainer>
  );
};

// 스타일 컴포넌트들
const FilterBarContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SelectedCount = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.normal};
  color: ${({ theme }) => theme.colors.primary};
`;

const ClearButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.size.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 20px;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SelectedTagsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SelectedTagsLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SelectedTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SelectedTag = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const TagIcon = styled.span`
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  opacity: 0.8;
`;

const TagText = styled.span`
  white-space: nowrap;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SelectedTagsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.infoLight || '#d1ecf1'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.info};
`;

const InfoIcon = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;