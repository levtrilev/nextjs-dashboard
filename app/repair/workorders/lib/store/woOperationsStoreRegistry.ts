// app/lib/store/woOperationsStoreRegistry.ts
import { createWoOperationsStore, WoOperationsState } from "./useWoOperationsStore";

// Глобальный реестр: один id → один Zustand-стор
const woOperationsStoreRegistry = new Map<string, ReturnType<typeof createWoOperationsStore>>();

export function getWoOperationsStore(workorderId: string): ReturnType<typeof createWoOperationsStore> {
  if (!woOperationsStoreRegistry.has(workorderId)) {
    woOperationsStoreRegistry.set(workorderId, createWoOperationsStore(workorderId));
  }
  return woOperationsStoreRegistry.get(workorderId)!;
}

// Опционально: явное удаление (чтобы избежать утечек памяти)
export function destroyWoOperationsStore(workorderId: string): void {
  woOperationsStoreRegistry.delete(workorderId);
}