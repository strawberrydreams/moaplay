import React, { useEffect, useState } from "react";
import { tagsApi } from "../../services/tagsApi";
import type { Tag } from "../../types/tags";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  FormContainer,
  Title,
  Subtitle,
  TagList,
  TagButton,
  ButtonRow,
  SubmitButton,
  BackButton,
  LoadingBox,
  ErrorBox,
  SearchInput
} from '../../styles/SelectTagsForm.styles';

interface SelectTagsFormProps {
  onCloseModal: () => void;
  onSaveTags?: (selectedIds: number[]) => void;  // 선택된 태그 저장 콜백
}

const MIN_SELECTION = 3;
const INITIAL_SHOW_COUNT = 23;

const SelectTagsForm: React.FC<SelectTagsFormProps> = ({
  onCloseModal,
  onSaveTags
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const { user, checkAuthStatus } = useAuthContext();

  useEffect(() => {
  checkAuthStatus();
}, []);
  
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

  useEffect(() => {
  (async () => {
    try {
      const data = await tagsApi.list();

      // ✅ 응답된 데이터가 비어있으면 PERMITTED_TAGS 사용
      if (!data || data.length === 0) {
        const fallbackTags: Tag[] = PERMITTED_TAGS.map((name, idx) => ({
            id: idx + 1,
            name,
            created_at: new Date().toISOString(),
        }));
        setTags(fallbackTags);
      } else {
        setTags(data);
      }
    } catch (err) {
      console.error(err);
    //   setError("태그를 불러오지 못했습니다. 😢");

      // ✅ 에러 발생 시에도 PERMITTED_TAGS 사용
      const fallbackTags: Tag[] = PERMITTED_TAGS.map((name, idx) => ({
        id: idx + 1,
        name,
        created_at: new Date().toISOString(), 
      }));
      setTags(fallbackTags);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTags(tags);
    } else {
      const lower = searchTerm.trim().toLowerCase();
      const filtered = tags.filter(tag => tag.name.toLowerCase().includes(lower));
      setFilteredTags(filtered);
    }
  }, [searchTerm, tags]);

  const toggleSelect = (id: number) => {
    setError(null);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length < MIN_SELECTION) {
      setError(`선호 태그는 최소 ${MIN_SELECTION}개 이상 선택해야 합니다!`);
      return;
    }
    setSubmitting(true);
    try {
      onSaveTags?.(selected);
      onCloseModal();
    } catch (err) {
      console.error(err);
      setError("저장 중 오류가 발생했습니다. 😢");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingBox>태그 불러오는 중...</LoadingBox>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Title>환영합니다, {user?.nickname || '홍길동'}님!</Title>
      <Subtitle>{user?.nickname || '홍길동'}님의 선호태그를 3개 이상 선택해주세요.</Subtitle>
      <span>태그</span>
      <SearchInput
        type="text"
        placeholder="태그를 입력해주세요"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <TagList>
        {filteredTags.slice(0, INITIAL_SHOW_COUNT).map(tag => (
          <TagButton
            key={tag.id}
            type="button"
            $selected={selected.includes(tag.id)}
            onClick={() => toggleSelect(tag.id)}
          >
            #{tag.name}
          </TagButton>
        ))}
        {filteredTags.length > INITIAL_SHOW_COUNT && (
          <div>+ 더 보기 ({filteredTags.length - INITIAL_SHOW_COUNT})</div>
        )}
      </TagList>

      <ButtonRow>
        <BackButton type="button" onClick={onCloseModal}>
          건너뛰기
        </BackButton>
        <SubmitButton type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : "설정하기"}
        </SubmitButton>
      </ButtonRow>
    </FormContainer>
  );
};

export default SelectTagsForm;
