import React, { useEffect, useState } from "react";
import { tagsApi } from "../../services/tagsApi";
import * as UserApi from "../../services/usersApi";
import type { Tag } from "../../types/tags";
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
  SearchInput,
} from "../../styles/SelectTagsForm.styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UpdateTagsFormProps {
  /** 유저가 이미 선택해 둔 태그 이름 배열 (ex. ['축제','전시']) */
  userTags?: string[];
  onCloseModal: () => void;
  onSuccess?: () => void;
}

const MIN_SELECTION = 3;
const INITIAL_SHOW_COUNT = 20;

const UpdateTagsForm: React.FC<UpdateTagsFormProps> = ({
  userTags = [],
  onCloseModal,
  onSuccess,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<string[]>(userTags); // 이름 기반 선택
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 모달이 열릴 때마다 props로 받은 userTags로 초기화
  useEffect(() => {
    setSelected(userTags);
  }, [userTags]);

  // 태그 불러오기
  useEffect(() => {
    (async () => {
      try {
        const data = await tagsApi.list();

        const safeData = Array.isArray(data?.tags)
          ? data.tags
          : Array.isArray(data)
          ? data
          : [];

        if (!Array.isArray(safeData)) throw new Error("잘못된 태그 데이터 형식");
        setTags(safeData);
        setFilteredTags(safeData);
      } catch (err) {
        console.error("태그 불러오기 실패:", err);
        setError("태그를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTags(tags);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredTags(tags.filter((t) => t.name.toLowerCase().includes(lower)));
    }
  }, [searchTerm, tags]);

  // 선택 토글 (이름 기반)
  const toggleSelect = (name: string) => {
    setError(null);
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length < MIN_SELECTION) {
      setError(`최소 ${MIN_SELECTION}개 이상 선택해야 합니다!`);
      return;
    }
    setSubmitting(true);
    try {
      await UserApi.updateMe({ preferred_tags: selected });
      toast.success("선호 태그가 변경되었습니다!");
      onSuccess?.();
      onCloseModal();
    } catch (err) {
      console.error("태그 저장 오류:", err);
      toast.error("태그 저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩/에러 처리
  if (loading) return <LoadingBox>태그 불러오는 중...</LoadingBox>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Title>선호 태그 변경</Title>
      <Subtitle>최소 {MIN_SELECTION}개 이상 선택해주세요.</Subtitle>

      <SearchInput
        type="text"
        placeholder="태그 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TagList>
        {filteredTags.slice(0, INITIAL_SHOW_COUNT).map((tag) => (
          <TagButton
            key={tag.id}
            type="button"
            $selected={selected.includes(tag.name)}
            onClick={() => toggleSelect(tag.name)}
          >
            #{tag.name}
          </TagButton>
        ))}

        {filteredTags.length > INITIAL_SHOW_COUNT && (
          <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#777" }}>
            + 더 보기 ({filteredTags.length - INITIAL_SHOW_COUNT})
          </div>
        )}
      </TagList>

      <ButtonRow>
        <BackButton type="button" onClick={onCloseModal}>
          취소
        </BackButton>
        <SubmitButton type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : "저장하기"}
        </SubmitButton>
      </ButtonRow>

      <ToastContainer position="bottom-center" hideProgressBar />
    </FormContainer>
  );
};

export default UpdateTagsForm;
