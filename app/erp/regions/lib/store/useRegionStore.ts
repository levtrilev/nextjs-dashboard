"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { RegionForm } from "@/app/lib/definitions";
import {
  setIsMessageBoxOpen,
  setMessageBoxText,
} from "@/app/store/useDocumentStore";
import { deleteRegion } from "../region-actions";

interface IInitialState {
  regions: RegionForm[];
}

interface IActions {
  fillRegions: (regions: RegionForm[]) => void;
  delRegion: (region: RegionForm) => void;
}

interface IRegionState extends IInitialState, IActions {}

const initialState = {
  regions: [],
};

const regionStore: StateCreator<
  IRegionState,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ]
> = (set) => ({
  ...initialState,
  fillRegions: (regions: RegionForm[]) => {
    set({ regions }, false, "fillRegions");
  },

  delRegion: async (region: RegionForm): Promise<void> => {
    try {
      await deleteRegion(region.id);
      set(
        (state: IRegionState) => {
          const index = state.regions.findIndex((r) => r.id === region.id);
          if (index !== -1) {
            state.regions.splice(index, 1);
          }
        },
        false,
        "delRegion"
      );
    } catch (error) {
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
});

const useRegionStore = create<IRegionState>()(
  immer(
    devtools(
      persist(regionStore, {
        name: "region-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          regions: state.regions,
        }),
      }),
      { name: "Regions" }
    )
  )
);

// Экспорты селекторов и экшенов
export const useRegions = () => useRegionStore((state) => state.regions);

export const fillRegions = (regions: RegionForm[]) =>
  useRegionStore.getState().fillRegions(regions);
export const delRegion = async (region: RegionForm) =>
  useRegionStore.getState().delRegion(region);
