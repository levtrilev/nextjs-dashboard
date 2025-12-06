// Хранилище для автозаполнения и выбранных тегов
import { create } from "zustand";

type TagStore = {
  allTags: string[];
  selectedTags: string[];
  input: string;

  setAllTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setInput: (input: string) => void;
  setSelectedTags: (tags: string[]) => void;
  getSuggestions: () => string[];
};

export const createTagStore = () => create<TagStore>((set, get) => ({
  allTags: [],
  selectedTags: [],
  input: "",

  setAllTags: (tags) => set({ allTags: tags }),
  setInput: (input) => set({ input }),

  addTag: (tag) => {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || get().selectedTags.includes(normalized)) return;
    set((state) => ({
      selectedTags: [...state.selectedTags, normalized],
      input: "",
    }));
  },

  removeTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.filter((t) => t !== tag),
    })),

  setSelectedTags: (tags) => {
    if (!tags) return;
    set({ selectedTags: tags.map((t) => t.trim().toLowerCase()) });
  },

  getSuggestions: () => {
    const { allTags, selectedTags, input } = get();
    if (!input) return [];
    const filtered = allTags
      .filter((tag) => !selectedTags.includes(tag))
      .filter((tag) => tag.toLowerCase().includes(input.toLowerCase()));
    return filtered.slice(0, 5);
  },
}));

export const useTagStore = createTagStore();
export const useAccessTagStore = createTagStore();
export const useUserTagStore = createTagStore();
