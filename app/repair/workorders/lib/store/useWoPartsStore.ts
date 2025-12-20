// store/useWoPartsStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface WOPart {
  id: string;
  work_name: string;
  part_name: string;
  quantity: string;
  isEditing?: boolean;
}

interface WoPartsState {
  wo_parts: WOPart[];
  setInitialParts: (parts: WOPart[]) => void;
  addNewPart: () => void;
  updatePartField: (id: string, field: keyof WOPart, value: string) => void;
  savePart: (id: string) => boolean;
  deletePart: (id: string) => void;
  validatePart: (part: WOPart) => boolean;
}

export const useWoPartsStore = create<WoPartsState>()(
  devtools(
    immer((set, get) => ({
      wo_parts: [],

      setInitialParts: (parts) => set({ wo_parts: parts }),

      addNewPart: () =>
        set((state) => {
          const newPart: WOPart = {
            id: `temp-${Date.now()}`,
            work_name: "",
            part_name: "",
            quantity: "",
            isEditing: true,
          };
          state.wo_parts.unshift(newPart);
        }),

      // updatePartField: (id, field, value) =>
      //   set((state) => {
      //     const part = state.wo_parts.find((p) => p.id === id);
      //     if (part) part[field] = value;
      //   }),
      updatePartField: (id, field, value) =>
        set((state) => {
          const part = state.wo_parts.find((p) => p.id === id);
          if (
            part &&
            (field === "work_name" ||
              field === "part_name" ||
              field === "quantity")
          ) {
            part[field] = value;
          }
        }),

      validatePart: (part) => {
        const qty = parseFloat(part.quantity);
        return (
          part.work_name.trim().length > 0 &&
          part.part_name.trim().length > 0 &&
          !isNaN(qty) &&
          qty > 0
        );
      },

      savePart: (id) => {
        const { wo_parts, validatePart } = get();
        const part = wo_parts.find((p) => p.id === id);
        if (!part || !validatePart(part)) return false;
        set((state) => {
          const found = state.wo_parts.find((p) => p.id === id);
          if (found) found.isEditing = false;
        });
        return true;
      },

      deletePart: (id) =>
        set((state) => {
          state.wo_parts = state.wo_parts.filter((p) => p.id !== id);
        }),
    })),
    { name: "WO Parts Store" }
  )
);
