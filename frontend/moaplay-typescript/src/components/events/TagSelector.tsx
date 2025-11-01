import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// 태그 선택 기능 Props
interface TagSelectorProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    maxTags?: number;
    error?: string;
}

// 허용된 태그 목록 (create_db.py에 있는 기본 태그 49개 그대로임)
// TODO: 별도의 태그 API가 구현되면 이 부분 삭제하기 (현재는 태그 API가 없음)
const PERMITTED_TAGS = [
    // 기본
    "행사", "이벤트", "온라인", "오프라인", "가볼만한곳", "주말에뭐하지",

    // 행사 종류별 - 문화예술
    "전시회", "콘서트", "페스티벌", "공연", "팬미팅", "영화",

    // 행사 종류별 - 상업/마켓
    "팝업스토어", "플리마켓", "박람회", "세일",

    // 행사 종류별 - 학습
    "세미나", "컨퍼런스", "강연", "워크숍", "클래스",

    // 행사 종류별 - 소셜
    "네트워킹", "파티", "소모임", "정모",

    // 행사 종류별 - 활동
    "원데이클래스", "스포츠", "게임", "여행", "봉사활동",

    // 행사 분위기별
    "힐링", "감성", "신나는", "액티비티", "조용한", "로맨틱",
    "핫플", "힙스터", "이색체험", "인생샷",

    // 행사 참여 대상
    "누구나", "가족나들이", "아이와함께", "커플추천", "친구랑",
    "혼자서도좋아", "직장인", "대학생", "반려동물동반"
];

// 실제 메뉴에 출력되는 기본 태그 (create_db.py에 있는 기본 태그 49개 그대로임)
const TAG_CATEGORIES: Record<string, string[]> = {
    '기본': ["행사", "이벤트", "온라인", "오프라인", "가볼만한곳", "주말에뭐하지"],
    '문화/예술': ["전시회", "콘서트", "페스티벌", "공연", "팬미팅", "영화"],
    '상업/마켓': ["팝업스토어", "플리마켓", "박람회", "세일"],
    '학습': ["세미나", "컨퍼런스", "강연", "워크숍", "클래스"],
    '소셜': ["네트워킹", "파티", "소모임", "정모"],
    '활동': ["원데이클래스", "스포츠", "게임", "여행", "봉사활동"],
    '분위기': ["힐링", "감성", "신나는", "액티비티", "조용한", "로맨틱"],
    '체험': ["핫플", "힙스터", "이색체험", "인생샷"],
    '지인과': ["누구나", "가족나들이", "아이와함께", "커플추천", "친구랑"],
    '혼자서': ["혼자서도좋아", "직장인", "대학생", "반려동물동반"],
};

// 태그 선택 컴포넌트
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

    // 커스텀 태그 추가하기 (현재는 작동 안함)
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

    // 태그 제거하기
    const removeTag = (tagToRemove: string) => {
        onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
    };

    // 입력값 변경
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setShowSuggestions(value.length > 0);
    };

    // 키보드 입력 처리
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

    // 제안 태그 필터링
    const getSuggestedTags = (): string[] => {
        if (!inputValue) return [];

        const query = inputValue.toLowerCase();
        return PERMITTED_TAGS.filter(tag =>
            tag.toLowerCase().includes(query) &&
            !selectedTags.includes(tag)
        ).slice(0, 10);
    };

    // 카테고리별 태그
    const getCategoryTags = (category: string): string[] => {
        if (category === '인기 태그') {
            return PERMITTED_TAGS.slice(0, 20);
        }
        return TAG_CATEGORIES[category] || [];
    };

    // 외부 클릭 시 제안 목록을 숨기기
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

            {/* 태그 입력 (현재는 작동 안함) */}
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
    width: 98.5%;
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
    background: #7a5af8;
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
    background-color: #fafbfc;
    color: #3e4150;

    &:focus {
        outline: none;
        border-color: ${props => props.hasError ? '#dc3545' : '#7a5af8'};
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

const AddButton = styled.button`
    padding: 12px 20px;
    background: #7a5af8;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: #6345d8ff;
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
    border: 1px solid ${props => props.active ? '#7a5af8' : '#dee2e6'};
    border-radius: 20px;
    background: ${props => props.active ? '#7a5af8' : 'white'};
    color: ${props => props.active ? 'white' : '#6c757d'};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: #7a5af8;
        color: ${props => props.active ? 'white' : '#7a5af8'};
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
        border-color: #7a5af8;
        color: #7a5af8;
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
    border-left: 4px solid #7a5af8;
`;

export default TagSelector;