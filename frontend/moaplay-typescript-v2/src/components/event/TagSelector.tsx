/**
 * 태그 선택 컴포넌트
 * 
 * 행사 태그를 선택하고 관리할 수 있는 컴포넌트입니다.
 * 기존 태그 선택과 새 태그 추가 기능을 제공합니다.
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

/**
 * 태그 선택기 Props
 */
interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  error?: string;
}

/**
 * 인기 태그 목록 (실제로는 API에서 가져와야 함)
 */
const POPULAR_TAGS = [
  '음악', '콘서트', '페스티벌', '전시회', '아트', '문화',
  '교육', '세미나', '워크샵', '컨퍼런스', '네트워킹',
  '스포츠', '운동', '마라톤', '요가', '피트니스',
  '음식', '요리', '맛집', '와인', '커피',
  '여행', '투어', '체험', '액티비티', '아웃도어',
  '기술', 'IT', '개발', '스타트업', '비즈니스',
  '가족', '아이', '키즈', '육아', '교육',
  '취미', '독서', '영화', '게임', '만화',
  '건강', '의료', '웰빙', '힐링', '명상',
  '자원봉사', '사회공헌', '환경', '지역사회'
];

/**
 * 태그 카테고리
 */
const TAG_CATEGORIES: Record<string, string[]> = {
  '문화/예술': ['음악', '콘서트', '페스티벌', '전시회', '아트', '문화', '영화', '연극', '뮤지컬'],
  '교육/세미나': ['교육', '세미나', '워크샵', '컨퍼런스', '강의', '스터디', '독서'],
  '스포츠/건강': ['스포츠', '운동', '마라톤', '요가', '피트니스', '건강', '웰빙', '힐링'],
  '음식/요리': ['음식', '요리', '맛집', '와인', '커피', '베이킹', '카페'],
  '여행/체험': ['여행', '투어', '체험', '액티비티', '아웃도어', '캠핑', '등산'],
  '비즈니스/기술': ['기술', 'IT', '개발', '스타트업', '비즈니스', '네트워킹', '창업'],
  '가족/키즈': ['가족', '아이', '키즈', '육아', '교육', '놀이', '체험'],
  '취미/여가': ['취미', '게임', '만화', '수집', '공예', 'DIY', '펫'],
  '사회/봉사': ['자원봉사', '사회공헌', '환경', '지역사회', '기부', '나눔']
};

/**
 * 태그 선택 컴포넌트
 */
export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  maxTags = 10,
  error
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('인기 태그');
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 태그 추가
   */
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (!trimmedTag) return;
    
    // 중복 검사
    if (selectedTags.includes(trimmedTag)) {
      alert('이미 선택된 태그입니다.');
      return;
    }
    
    // 최대 개수 검사
    if (selectedTags.length >= maxTags) {
      alert(`태그는 최대 ${maxTags}개까지 선택할 수 있습니다.`);
      return;
    }
    
    // 태그 길이 검사
    if (trimmedTag.length > 20) {
      alert('태그는 20자 이하로 입력해주세요.');
      return;
    }
    
    // 특수문자 검사
    if (!/^[가-힣a-zA-Z0-9\s]+$/.test(trimmedTag)) {
      alert('태그는 한글, 영문, 숫자만 사용할 수 있습니다.');
      return;
    }
    
    onTagsChange([...selectedTags, trimmedTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  /**
   * 태그 제거
   */
  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  /**
   * 입력값 변경 처리
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  /**
   * 키보드 입력 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // 입력값이 없을 때 백스페이스로 마지막 태그 제거
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  /**
   * 제안 태그 필터링
   */
  const getSuggestedTags = (): string[] => {
    if (!inputValue) return [];
    
    const query = inputValue.toLowerCase();
    return POPULAR_TAGS.filter(tag => 
      tag.toLowerCase().includes(query) && 
      !selectedTags.includes(tag)
    ).slice(0, 10);
  };

  /**
   * 카테고리별 태그 가져오기
   */
  const getCategoryTags = (category: string): string[] => {
    if (category === '인기 태그') {
      return POPULAR_TAGS.slice(0, 20);
    }
    return TAG_CATEGORIES[category] || [];
  };

  /**
   * 외부 클릭 시 제안 목록 숨기기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const suggestedTags = getSuggestedTags();
  const categoryTags = getCategoryTags(activeCategory);

  return (
    <TagSelectorContainer>
      {/* 선택된 태그 목록 */}
      {selectedTags.length > 0 && (
        <SelectedTagsContainer>
          <SelectedTagsTitle>
            선택된 태그 ({selectedTags.length}/{maxTags})
          </SelectedTagsTitle>
          <SelectedTagsList>
            {selectedTags.map((tag, index) => (
              <SelectedTag key={index}>
                <TagText>#{tag}</TagText>
                <RemoveButton
                  type="button"
                  onClick={() => removeTag(tag)}
                  title="태그 제거"
                >
                  ✕
                </RemoveButton>
              </SelectedTag>
            ))}
          </SelectedTagsList>
        </SelectedTagsContainer>
      )}

      {/* 태그 입력 */}
      <TagInputContainer>
        <TagInputLabel>태그 추가</TagInputLabel>
        <TagInputWrapper>
          <TagInput
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="태그를 입력하고 Enter를 누르세요"
            hasError={!!error}
          />
          {inputValue && (
            <AddButton
              type="button"
              onClick={() => addTag(inputValue)}
            >
              추가
            </AddButton>
          )}
        </TagInputWrapper>

        {/* 입력 제안 */}
        {showSuggestions && suggestedTags.length > 0 && (
          <SuggestionsContainer>
            <SuggestionsTitle>제안 태그</SuggestionsTitle>
            <SuggestionsList>
              {suggestedTags.map((tag, index) => (
                <SuggestionItem
                  key={index}
                  onClick={() => addTag(tag)}
                >
                  #{tag}
                </SuggestionItem>
              ))}
            </SuggestionsList>
          </SuggestionsContainer>
        )}
      </TagInputContainer>

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {/* 카테고리별 태그 선택 */}
      <CategoryContainer>
        <CategoryTitle>카테고리별 태그</CategoryTitle>
        
        <CategoryTabs>
          {['인기 태그', ...Object.keys(TAG_CATEGORIES)].map(category => (
            <CategoryTab
              key={category}
              type="button"
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </CategoryTab>
          ))}
        </CategoryTabs>

        <CategoryTagsContainer>
          {categoryTags
            .filter(tag => !selectedTags.includes(tag))
            .map((tag, index) => (
              <CategoryTag
                key={index}
                type="button"
                onClick={() => addTag(tag)}
                disabled={selectedTags.length >= maxTags}
              >
                #{tag}
              </CategoryTag>
            ))}
        </CategoryTagsContainer>
      </CategoryContainer>

      {/* 도움말 */}
      <TagHelp>
        💡 태그는 행사를 찾기 쉽게 도와줍니다. 관련성 높은 태그를 선택해주세요.
      </TagHelp>
    </TagSelectorContainer>
  );
};

// 스타일 컴포넌트들
const TagSelectorContainer = styled.div`
  width: 100%;
`;

const SelectedTagsContainer = styled.div`
  margin-bottom: 20px;
`;

const SelectedTagsTitle = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const SelectedTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SelectedTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border-radius: 16px;
  font-size: 14px;
`;

const TagText = styled.span`
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TagInputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const TagInputLabel = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const TagInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const TagInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e9ecef'};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const AddButton = styled.button`
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 4px;
`;

const SuggestionsTitle = styled.div`
  padding: 12px 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
`;

const SuggestionsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const ErrorMessage = styled.div`
  margin-bottom: 16px;
  font-size: 14px;
  color: #dc3545;
`;

const CategoryContainer = styled.div`
  margin-bottom: 20px;
`;

const CategoryTitle = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const CategoryTab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.active ? '#007bff' : '#dee2e6'};
  border-radius: 20px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    border-color: #007bff;
    color: ${props => props.active ? 'white' : '#007bff'};
  }
`;

const CategoryTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CategoryTag = styled.button<{ disabled?: boolean }>`
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 16px;
  background: white;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    border-color: #007bff;
    color: #007bff;
    background: #f8f9fa;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const TagHelp = styled.div`
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #6c757d;
  border-left: 4px solid #007bff;
`;

export default TagSelector;