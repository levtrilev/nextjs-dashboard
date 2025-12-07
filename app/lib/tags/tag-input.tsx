'use client';

import { useOrTagStore, useAndTagStore, useNoTagStore } from '@/app/admin/permissions/[id]/edit/permission-edit-form';
import { useState, useRef, useEffect } from 'react';
import { useAccessTagStore, useTagStore, useUserTagStore } from './tag-store';

export function TagInput({ id, value, onAdd, handleFormInputChange }: {
    id: string;
    value: string[];
    onAdd: (tag: string) => void;
    handleFormInputChange: (tags: string[]) => void;
}) {
    const { input, selectedTags, setInput, setSelectedTags, getSuggestions, removeTag } =
        id === 'user_tags' ? useUserTagStore()
            : id === 'access_tags' ? useAccessTagStore()
                : id === 'or_tags' ? useOrTagStore()
                    : id === 'and_tags' ? useAndTagStore()
                        : id === 'no_tags' ? useNoTagStore()
                            : useTagStore();

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRefs = useRef<(HTMLLIElement | null)[]>([]);


    useEffect(() => {
        setSuggestions(getSuggestions());
        setHighlightedIndex(-1); // сброс при обновлении списка
    }, [input, selectedTags, getSuggestions]);

    // 🟢 Инициализируем selectedTags из value при монтировании (и при обновлении value)
    useEffect(() => {
        setSelectedTags(value);
    }, [value, setSelectedTags]);

    const selectSuggestion = (suggestion: string) => {
        onAdd(suggestion);
        handleFormInputChange(selectedTags);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) {
            // Если подсказок нет, обрабатываем только Enter/Comma
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                if (input.trim()) {
                    onAdd(input);
                    handleFormInputChange(selectedTags);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    selectSuggestion(suggestions[highlightedIndex]);
                } else if (e.key === 'Enter' && input.trim()) {
                    // Если ничего не выделено — добавляем введённый тег по Enter
                    onAdd(input);
                    handleFormInputChange(selectedTags);
                }
                break;
            case 'Escape':
                setHighlightedIndex(-1);
                break;
            case ',':
                e.preventDefault();
                if (input.trim()) {
                    onAdd(input);
                    handleFormInputChange(selectedTags);
                }
                break;
            default:
                break;
        }
    };

    // Прокручиваем выделенный элемент в видимую область
    useEffect(() => {
        if (highlightedIndex >= 0 && suggestionRefs.current[highlightedIndex]) {
            suggestionRefs.current[highlightedIndex]?.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [highlightedIndex]);

    return (
        <div id={id} className="relative w-full">
            <div className="flex flex-wrap gap-1 border border-gray-200 rounded-lg p-2">
                {selectedTags.map((tag) => (
                    <span key={tag} className="bg-blue-100 px-2 py-1 rounded flex items-center">
                        {tag}
                        <button
                            type="button"
                            onClick={() => {
                                removeTag(tag);
                                handleFormInputChange(selectedTags);
                            }}
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
                    {suggestions.map((sug, index) => (
                        <li
                            key={sug}
                            ref={(el) => {
                                suggestionRefs.current[index] = el;
                            }}
                            className={`p-2 cursor-pointer ${highlightedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'
                                }`}
                            onClick={() => selectSuggestion(sug)}
                        >
                            {sug}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}