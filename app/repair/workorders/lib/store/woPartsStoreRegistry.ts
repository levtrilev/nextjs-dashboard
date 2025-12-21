// app/lib/store/woPartsStoreRegistry.ts
import { createWoPartsStore, WoPartsState } from "./useWoPartsStore";

const woPartsStoreRegistry = new Map<string, ReturnType<typeof createWoPartsStore>>();

export function getWoPartsStore(workorderId: string): ReturnType<typeof createWoPartsStore> {
  if (!woPartsStoreRegistry.has(workorderId)) {
    woPartsStoreRegistry.set(workorderId, createWoPartsStore(workorderId));
  }
  return woPartsStoreRegistry.get(workorderId)!;
}

export function destroyWoPartsStore(workorderId: string): void {
  woPartsStoreRegistry.delete(workorderId);
}