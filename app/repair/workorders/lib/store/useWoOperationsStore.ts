// store/useWoOperationsStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWoOperation } from "../wo-operations-actions";

export interface WOOperation {
  id: string;
  name: string;
  work_name: string;
  work_id: string;
  operation_name: string;
  operation_id: string;
  hours_norm: string;
  isEditing?: boolean;
}

interface WoOperationsState {
  wo_operations: WOOperation[];
  setInitialOperations: (ops: WOOperation[]) => void;
  addNewOperation: (current_work:{id: string; name: string}) => void;
  updateOperationField: (
    id: string,
    field: keyof WOOperation,
    value: string
  ) => void;
  saveOperation: (id: string, operation_name: string, workorder_id: string, section_id: string, work_id: string) => Promise<boolean>;
  deleteWoOperationFromState: (id: string) => void;
  validateOperation: (op: WOOperation) => boolean;
}

export const useWoOperationsStore = create<WoOperationsState>()(
  devtools(
    immer((set, get) => ({
      wo_operations: [],

      setInitialOperations: (ops) => set({ wo_operations: ops }),

      addNewOperation: (current_work:{id: string; name: string}) =>
        set((state) => {
          const newOp: WOOperation = {
            id: `temp-${Date.now()}`,
            name: "",
            work_name: current_work.name,
            work_id: current_work.id,
            operation_name: "",
            operation_id: "",
            hours_norm: "",
            isEditing: true,
          };
          state.wo_operations.unshift(newOp);
        }),

      // updateOperationField: (id, field, value) =>
      //   set((state) => {
      //     const op = state.wo_operations.find((op) => op.id === id);
      //     if (op) op[field] = value;
      //   }),
      updateOperationField: (id, field, value) =>
        set((state) => {
          const op = state.wo_operations.find((op) => op.id === id);
          if (
            op &&
            (field === "work_name" ||
              field === "operation_name" ||
              field === "hours_norm")
          ) {
            op[field] = value;
          }
        }),
      validateOperation: (op) => {
        const norm = parseFloat(op.hours_norm);
        return (
          op.work_name.trim().length > 0 &&
          op.operation_name.trim().length > 0 &&
          !isNaN(norm) &&
          norm > 0
        );
      },

saveOperation: async (id: string, operation_name: string, workorder_id: string, section_id: string, work_id: string) => {
  const { wo_operations, validateOperation } = get();
  const op = wo_operations.find((op) => op.id === id);
  if (!op || !validateOperation(op)) return false;

  // Если это существующая операция (не временная) — просто выходим из режима редактирования
  if (!id.startsWith('temp-')) {
    set((state) => {
      const found = state.wo_operations.find((o) => o.id === id);
      if (found) found.isEditing = false;
    });
    return true;
  }

  try {
    const newOpData = {
      id: '',
      name: operation_name,
      workorder_id,
      work_id: work_id,
      operation_id: '00000000-0000-0000-0000-000000000000', // не заполняем, поскольку это операция уровна наряда
      hours_norm: parseFloat(op.hours_norm),
      section_id: section_id, // "1d74d3fb-6dca-4993-9832-1bc65cca79a6",
    };

    const savedWoOpId = await createWoOperation(newOpData);

    set((state) => {
      const index = state.wo_operations.findIndex((o) => o.id === id);
      if (index !== -1) {
        state.wo_operations[index] = {
          ...op,
          id: savedWoOpId,
          isEditing: false,
          operation_name: operation_name,
        };
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to save operation:', error);
    return false;
  }
},

      deleteWoOperationFromState: (id) =>
        set((state) => {
          state.wo_operations = state.wo_operations.filter(
            (op) => op.id !== id
          );
        }),
    })),
    { name: "WO Operations Store" }
  )
);
