import React, { useEffect, useState } from "react";
import { tagsApi } from "../../services/tagsApi";
import type { Tag } from "../../types/tags";
import { useAuthContext } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../../styles/components/Spinner.styles";
import {
    FormContainer,
    Title,
    Subtitle,
    TagList,
    TagButton,
    ButtonRow,
    SubmitButton,
    BackButton,
    ErrorBox,
    SearchInput,
} from "../../styles/components/SelectTagsForm.styles";

interface SelectTagsFormProps {
    onCloseModal: () => void;
    onSaveTags?: (selectedIds: number[]) => void; // 선택된 태그 저장 콜백
}

const MIN_SELECTION = 3;
const INITIAL_SHOW_COUNT = 23;

const SelectTagsForm: React.FC<SelectTagsFormProps> = ({
                                                           onCloseModal,
                                                           onSaveTags,
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

    // 서버에서 태그 목록 불러오기
    useEffect(() => {
        (async () => {
            try {
                const data = await tagsApi.list();

                // 서버 응답이 배열인지 확인 (또는 {tags: [...]} 형태 지원)
                const safeData = Array.isArray(data?.tags)
                    ? data.tags
                    : Array.isArray(data)
                        ? data
                        : [];

                setTags(safeData);
                setFilteredTags(safeData);
            } catch (err) {
                console.error("태그 목록 불러오기 실패:", err);
                setError("태그를 불러오지 못했습니다. 😢");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // 검색 기능
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredTags(tags);
        } else {
            const lower = searchTerm.trim().toLowerCase();
            setFilteredTags(
                tags.filter((tag) => tag.name.toLowerCase().includes(lower))
            );
        }
    }, [searchTerm, tags]);

    // 태그 선택/해제
    const toggleSelect = (id: number) => {
        setError(null);
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    // 저장 처리
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
            console.error("태그 저장 중 오류 발생:", err);
            setError("저장 중 오류가 발생했습니다. 😢");
        } finally {
            setSubmitting(false);
        }
    };

    // 로딩 중 → 스피너 표시
    if (loading)
        return (
            <LoadingSpinner>
                <div className="spinner"></div>
                <p>태그 불러오는 중...</p>
            </LoadingSpinner>
        );

    return (
        <FormContainer onSubmit={handleSubmit}>
            <Title>환영합니다, {user?.nickname || "홍길동"}님!</Title>
            <Subtitle>
                {user?.nickname || "홍길동"}님의 선호태그를 {MIN_SELECTION}개 이상
                선택해주세요.
            </Subtitle>

            <span>태그</span>
            <SearchInput
                type="text"
                placeholder="태그를 검색해주세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <TagList>
                {filteredTags.slice(0, INITIAL_SHOW_COUNT).map((tag) => (
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

            {error && <ErrorBox>{error}</ErrorBox>}

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
