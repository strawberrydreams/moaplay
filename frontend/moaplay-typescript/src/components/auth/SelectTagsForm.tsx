import React, { useEffect, useState } from "react";
import { tagsApi } from "../../services/tagsApi";
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
} from '../../styles/SelectTagsForm.styles'

interface SelectTagsFormProps {
    onCloseModal: () =>  void;
}

const SelectTagsForm: React.FC<SelectTagsFormProps> = ({
                                                            onCloseModal
                                                       }) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await tagsApi.list();
                setTags(data);
            } catch (err) {
                console.error(err);
                setError("태그를 불러오지 못했습니다. 😢");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selected.length < 3) {
            setError(`선호 태그는 최소 ${3}개 이상 선택해야 합니다!`);
            return;
        }
        setSubmitting(true);
        try {
            await onCloseModal
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
            <Title>선호 태그 선택</Title>
            <Subtitle>선호하는 태그를 최소 {3}개 이상 선택해주세요.</Subtitle>

            <TagList>
                {tags.map((tag) => (
                    <TagButton
                        key={tag.id}
                        type="button"
                        $selected={selected.includes(tag.id)}
                        onClick={() => toggleSelect(tag.id)}
                    >
                        #{tag.name}
                    </TagButton>
                ))}
            </TagList>

            <ButtonRow>
                <BackButton type="button" onClick={onCloseModal}>
                    건너뛰기
                </BackButton>
                <SubmitButton type="submit" disabled={submitting}>
                    {submitting ? "저장 중..." : "완료"}
                </SubmitButton>
            </ButtonRow>
        </FormContainer>
    );
};

export default SelectTagsForm;
