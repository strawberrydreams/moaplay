import { useState, type ChangeEvent } from 'react';

export const useTags = (maxTags: number = 5) => {
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  const addTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    if (tags.length >= maxTags) {
      alert(`태그는 최대 ${maxTags}개까지 추가할 수 있습니다.`);
      setNewTagInput('');
      return;
    }
    setTags(prev => [...prev, trimmed]);
    setActiveTag(trimmed);
    setNewTagInput('');
  };

  const deleteTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    if (activeTag === tag) {
      setActiveTag(null);
    }
  };

  const handleNewTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTagInput(e.target.value);
  };

  return {
    tags,
    activeTag,
    newTagInput,
    setNewTagInput,
    handleNewTagInputChange,
    addTag,
    deleteTag,
    setActiveTag,
  };
};
