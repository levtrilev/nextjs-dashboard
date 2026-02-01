// stores/stockMovementFormStore.ts

import { create } from 'zustand';
import { StockMovement, StockMovementForm } from '@/app/lib/definitions';

type FormState = Omit<StockMovementForm, 'id'> & { id?: string };

interface StockMovementFormStore {
  form: FormState | null;
  setForm: (form: FormState | null) => void;
  reset: () => void;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}

export const useStockMovementFormStore = create<StockMovementFormStore>((set) => ({
  form: null,
  setForm: (form) => set({ form }),
  reset: () => set({ form: null }),
  updateField: (field, value) =>
    set((state) => ({
      form: state.form ? { ...state.form, [field]: value } : null,
    })),
}));