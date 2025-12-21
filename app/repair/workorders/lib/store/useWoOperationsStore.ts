// app/lib/store/woOperationsStoreFactory.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWoOperation } from "../wo-operations-actions";

export interface WoOperation {
  id: string;
  name: string;
  work_name: string;
  work_id: string;
  operation_name: string;
  operation_id: string;
  hours_norm: string;
  isEditing?: boolean;
}

export interface WoCurrentWork {
  id: string;
  name: string;
}

export interface WoOperationsState {
  wo_operations: WoOperation[];
  wo_current_work: WoCurrentWork;
  setInitialOperations: (ops: WoOperation[]) => void;
  setCurrentWork: (work: WoCurrentWork) => void;
  addNewOperation: (current_work: { id: string; name: string }) => void;
  updateOperationField: (
    id: string,
    field: keyof WoOperation,
    value: string
  ) => void;
  saveOperation: (
    id: string,
    operation_name: string,
    workorder_id: string,
    section_id: string,
    work_id: string
  ) => Promise<boolean>;
  deleteWoOperationFromState: (id: string) => void;
  validateOperation: (op: WoOperation) => boolean;
  saveNewOperationsToDB: (
    workorder_id: string,
    section_id: string
  ) => Promise<boolean>;
}

// Фабрика: создаёт НОВЫЙ экземпляр стора
export const createWoOperationsStore = (id: string) =>
  create<WoOperationsState>()(
    devtools(
      immer((set, get) => ({
        wo_operations: [],
        wo_current_work: { id: "", name: "" },
        setInitialOperations: (ops) => set({ wo_operations: ops }),
        setCurrentWork: (work) => set({ wo_current_work: work }),
        addNewOperation: (current_work) =>
          set((state) => {
            const newOp: WoOperation = {
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
        saveOperation: async (id, operation_name, workorder_id, section_id, work_id) => {
          const { wo_operations, validateOperation } = get();
          const op = wo_operations.find((op) => op.id === id);
          if (!op || !validateOperation(op)) return false;

          if (!id.startsWith("temp-")) {
            set((state) => {
              const found = state.wo_operations.find((o) => o.id === id);
              if (found) found.isEditing = false;
            });
            return true;
          }

          set((state) => {
            const index = state.wo_operations.findIndex((o) => o.id === id);
            if (index !== -1) {
              state.wo_operations[index] = {
                ...op,
                isEditing: false,
                operation_name,
              };
            }
          });
          return true;
        },
        saveNewOperationsToDB: async (workorder_id: string, section_id: string): Promise<boolean> => {
          const { wo_operations, validateOperation } = get();
          const tempOps = wo_operations
            .filter((op) => op.id.startsWith("temp-") && validateOperation(op));

          if (tempOps.length === 0) return true;

          try {
            const savedResults = await Promise.all(
              tempOps.map(async (op) => {
                const newOpData = {
                  id: "",
                  name: op.operation_name,
                  workorder_id,
                  work_id: op.work_id,
                  operation_id: "00000000-0000-0000-0000-000000000000",
                  hours_norm: parseFloat(op.hours_norm),
                  section_id,
                };
                const savedId = await createWoOperation(newOpData);
                return { originalId: op.id, savedId };
              })
            );

            const idMap = new Map(savedResults.map(r => [r.originalId, r.savedId]));

            set((state) => {
              const updatedOps = state.wo_operations.map((op) => {
                if (op.id.startsWith("temp-") && idMap.has(op.id)) {
                  return {
                    ...op,
                    id: idMap.get(op.id)!,
                    operation_id: "00000000-0000-0000-0000-000000000000",
                    isEditing: false,
                    operation_name: "",
                    name: op.operation_name,
                  };
                }
                return op;
              });
              return { ...state, wo_operations: updatedOps };
            });

            return true;
          } catch (error) {
            console.error("Failed to save operations:", error);
            return false;
          }
        },
        deleteWoOperationFromState: (id) =>
          set((state) => {
            state.wo_operations = state.wo_operations.filter((op) => op.id !== id);
          }),
      })),
      { name: `WO Operations Store [${id}]` }
    )
  );