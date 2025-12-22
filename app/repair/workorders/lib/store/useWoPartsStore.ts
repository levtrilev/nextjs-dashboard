// app/lib/store/woPartsStoreFactory.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWoPart, deleteWoPart } from "../wo-parts-actions";

export interface WoPart {
  id: string;
  name: string;
  work_name: string;
  part_name: string;
  quantity: string;
  isEditing?: boolean;
  work_id?: string;
  isToBeDeleted: boolean;
}
export interface WoCurrentWork {
  id: string;
  name: string;
}
export interface WoPartsState {
  wo_parts: WoPart[];
  wo_current_work: WoCurrentWork;
  setInitialParts: (parts: WoPart[]) => void;
  setCurrentWork: (work: WoCurrentWork) => void;
  addNewPart: (work: { id: string; name: string }) => void;
  updatePartField: (id: string, field: keyof WoPart, value: string) => void;
  savePart: (
    id: string,
    part_name: string,
    workorder_id: string,
    section_id: string,
    work_id: string
  ) => Promise<boolean>;
  deletePartFromState: (id: string) => void;
  markWoPartToBeDeleted: (id: string) => void;
  validatePart: (part: WoPart) => boolean;
  saveNewPartsToDB: (
    workorder_id: string,
    section_id: string
  ) => Promise<boolean>;
  deleteMarkedPartsFromDB: () => Promise<boolean>;
}

export const createWoPartsStore = (id: string) =>
  create<WoPartsState>()(
    devtools(
      immer((set, get) => ({
        wo_parts: [],
        wo_current_work: { id: "", name: "" },
        // setInitialParts: (parts) => set({ wo_parts: parts }),
        setInitialParts: (parts) => {
            set({
            wo_parts: parts,
            wo_current_work: { id: parts[0]?.work_id || "", name: parts[0]?.work_name || "", }
          });
        },        setCurrentWork: (work) => set({ wo_current_work: work }),
        addNewPart: (work) =>
          set((state) => {
            const newPart: WoPart = {
              id: `temp-${Date.now()}`,
              name: "",
              work_name: work.name,
              work_id: work.id,
              part_name: "",
              quantity: "",
              isEditing: true,
              isToBeDeleted: false,
            };
            state.wo_parts.unshift(newPart);
          }),
        updatePartField: (id, field, value) =>
          set((state) => {
            const part = state.wo_parts.find((p) => p.id === id);
            if (part && (field === "part_name" || field === "quantity")) {
              part[field] = value;
            }
          }),
        validatePart: (part) => {
          const qty = parseFloat(part.quantity);
          return part.part_name.trim().length > 0 && !isNaN(qty) && qty > 0;
        },
        savePart: async (id, part_name, workorder_id, section_id, work_id) => {
          const { wo_parts, validatePart } = get();
          const part = wo_parts.find((p) => p.id === id);
          if (!part || !validatePart(part)) return false;

          if (!id.startsWith("temp-")) {
            set((state) => {
              const found = state.wo_parts.find((p) => p.id === id);
              if (found) found.isEditing = false;
            });
            return true;
          }

          set((state) => {
            const index = state.wo_parts.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.wo_parts[index] = {
                ...part,
                isEditing: false,
                part_name,
              };
            }
          });
          return true;
        },
        saveNewPartsToDB: async (
          workorder_id: string,
          section_id: string
        ): Promise<boolean> => {
          const { wo_parts, validatePart } = get();
          const tempParts = wo_parts.filter(
            (p) => p.id.startsWith("temp-") && validatePart(p)
          );

          if (tempParts.length === 0) return true;

          try {
            const savedResults = await Promise.all(
              tempParts.map(async (part) => {
                const newPartData = {
                  id: "",
                  name: part.part_name,
                  workorder_id,
                  work_id:
                    part.work_id || "00000000-0000-0000-0000-000000000000",
                  part_id: "00000000-0000-0000-0000-000000000000", // placeholder
                  quantity: parseFloat(part.quantity),
                  section_id,
                };
                const savedId = await createWoPart(newPartData);
                return { originalId: part.id, savedId };
              })
            );

            const idMap = new Map(
              savedResults.map((r) => [r.originalId, r.savedId])
            );

            set((state) => {
              const updatedParts = state.wo_parts.map((part) => {
                if (part.id.startsWith("temp-") && idMap.has(part.id)) {
                  return {
                    ...part,
                    id: idMap.get(part.id)!,
                    part_id: "00000000-0000-0000-0000-000000000000",
                    isEditing: false,
                    part_name: "",
                    name: part.part_name,
                  };
                }
                return part;
              });
              return { ...state, wo_parts: updatedParts };
            });

            return true;
          } catch (error) {
            console.error("Failed to save parts:", error);
            return false;
          }
        },
        deletePartFromState: (id) =>
          set((state) => {
            state.wo_parts = state.wo_parts.filter((p) => p.id !== id);
          }),
        markWoPartToBeDeleted: (id) =>
          set((state) => {
            const p = state.wo_parts.find((p) => p.id === id);
            if (p) {
              p.isToBeDeleted = !p.isToBeDeleted;
            }
          }),
        deleteMarkedPartsFromDB: async (): Promise<boolean> => {
          const { wo_parts } = get();
          const notMarkedParts = wo_parts.filter(
            (p) => !p.isToBeDeleted
          );
          const markedParts = wo_parts.filter(
            (p) => p.isToBeDeleted
          );
          if (markedParts.length !== 0) {
            try {
              await Promise.all(
                markedParts.map(async (p) => {
                  if (!p.id.startsWith("temp-")) await deleteWoPart(p.id);
                })
              );
            } catch (error) {
              console.error("Failed to delete part: ", error);
              throw new Error("Failed to delete part: " + String(error));
            }
          }
          if (notMarkedParts.length === 0) return true;

          set((state) => {
            return { ...state, wo_parts: notMarkedParts };
          });
          return true;
        },
      })),
      { name: `WO Parts Store [${id}]` }
    )
  );
