'use client';

import { useOrTagStore, useAndTagStore, useNoTagStore } from '@/app/admin/permissions/[id]/edit/permission-edit-form';
import { useState, useRef, useEffect } from 'react';
import { useAccessTagStore, useTagStore, useUserTagStore } from './tag-store';

export function TagInput({ id, value, onAdd, handleFormInputChange }: {
    id: string;
    value: string[];
    onAdd: (tag: string) => void;
    handleFormInputChange: (tags: string[]) => void
}) {
    const { input, selectedTags, setInput, setSelectedTags, getSuggestions, removeTag } =
        id === 'user_tags' ? useUserTagStore()
            : id === 'access_tags' ? useAccessTagStore()
                : id === 'or_tags' ? useOrTagStore()
                    : id === 'and_tags' ? useAndTagStore()
                        : id === 'no_tags' ? useNoTagStore()
                            : useTagStore();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSuggestions(getSuggestions());
    }, [input, selectedTags, getSuggestions]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (input.trim()) {
                onAdd(input);
            }
            handleFormInputChange(selectedTags)
        }
    };
    // 🟢 Инициализируем selectedTags из value при монтировании (и при обновлении value)
    useEffect(() => {
        setSelectedTags(value);
    }, [value, setSelectedTags]);


    return (
        <div id={id} className="relative w-full">
            <div className="flex flex-wrap gap-1 border border-gray-200 rounded-lg p-2">
                {selectedTags.map((tag) => (
                    <span key={tag} className="bg-blue-100 px-2 py-1 rounded flex items-center">
                        {tag}
                        <button
                            type="button"
                            // onClick={() => { useTagStore.getState().removeTag(tag); handleFormInputChange(selectedTags) }}
                            onClick={() => { removeTag(tag); handleFormInputChange(selectedTags) }}
                            className="ml-1 text-xs"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="outline-none flex-1 min-w-[80px]"
                    placeholder="Введите теги..."
                />
            </div>

            {suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-auto">
                    {suggestions.map((sug) => (
                        <li
                            key={sug}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => { onAdd(sug); handleFormInputChange(selectedTags) }}
                        >
                            {sug}
                        </li>
                    ))}
                </ul>
            )}
        </div>

    );
}