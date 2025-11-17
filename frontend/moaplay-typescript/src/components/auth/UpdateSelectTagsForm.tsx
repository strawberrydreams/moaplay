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
    SearchInput
} from "../../styles/components/SelectTagsForm.styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UpdateTagsFormProps {
    userTags?: Tag[];
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
    const [selected, setSelected] = useState<string[]>(userTags.map(tag => tag.name)); //  이름 기반 선택
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    //  태그 불러오기 (tagsApi.list 사용)
    useEffect(() => {
        (async () => {
            try {
                const data = await tagsApi.list();

                // 서버 응답이 { tags: [...] } 형태이거나, 바로 배열일 수도 있음
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

    // ✅ 검색 필터링
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredTags(tags);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredTags(tags.filter(t => t.name.toLowerCase().includes(lower)));
        }
    }, [searchTerm, tags]);

    // 선택 토글 (이름 기반)
    const toggleSelect = (name: string) => {
        setError(null);
        setSelected(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
        console.log(selected);
    };

    //  저장
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
    if (filteredTags.length === 0) return <ErrorBox>불러올 태그가 없습니다.</ErrorBox>;

    return (
        <FormContainer onSubmit={handleSubmit}>
            <Title>선호 태그 변경</Title>
            <Subtitle>최소 {MIN_SELECTION}개 이상 선택해주세요.</Subtitle>

            <SearchInput
                type="text"
                placeholder="태그 검색"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />

            <TagList>
                {filteredTags.map(tag => (
                    <TagButton
                        key={tag.id}
                        type="button"
                        $selected={selected.includes(tag.name)}
                        onClick={() => toggleSelect(tag.name)}
                    >
                        #{tag.name}
                    </TagButton>
                ))}
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
