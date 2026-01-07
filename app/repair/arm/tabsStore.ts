// app/store/tabsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";

export interface TabsState {
  isSelected: boolean;
  tabs: string[];
  statusTab: string;
  effectiveSections: string[];
  allowedSections: string[];
  currentUserId: string | null;
  _hasHydrated: boolean; // флаг гидратации
  setIsSelected: (isSelected: boolean) => void;
  addTab: (value: string) => void;
  deleteTab: (value: string) => void;
  dropTabs: () => void;
  setStatusTab: (value: string) => void;
  setEffectiveSections: (sections: string[]) => void;
  setAllowedSections: (sections: string[]) => void;
  setUserId: (userId: string) => void;
  reset: () => void;
  setHasHydrated: () => void;
}

export const useTabsStore = create<TabsState>()(
  devtools(
    persist(
      (set, get) => ({
        isSelected: false,
        tabs: [],
        statusTab: "",
        effectiveSections: [],
        allowedSections: [],
        currentUserId: null,
        _hasHydrated: false,
        setIsSelected: (isSelected) => set({ isSelected }),

        addTab: (value) =>
          set((state) => {
            if (state.tabs.includes(value)) return state;
            return { tabs: [...state.tabs, value] };
          }),

        deleteTab: (value) =>
          set((state) => ({
            tabs: state.tabs.filter((tab) => tab !== value),
          })),

        setStatusTab: (value) => set({ statusTab: value }),
        setEffectiveSections: (sections) =>
          set({ effectiveSections: sections }),
        setAllowedSections: (sections) => set({ allowedSections: sections }),

        setUserId: (userId: string) => {
          const { currentUserId } = get();
          if (currentUserId !== userId) {
            // Сброс при смене пользователя
            console.log("Сброс при смене пользователя");
            set({
              currentUserId: userId,
              tabs: [],
              // tabs: get().effectiveSections,
              //   effectiveSections: [],
              //   allowedSections: [],
            });
          }
        },
        dropTabs: () => set({ tabs: [] }),
        reset: () => set({ isSelected: false, tabs: [], statusTab: "" }),
        setHasHydrated: () => set({ _hasHydrated: true }),
      }),
      {
        name: "tabs-storage",
        storage: createJSONStorage(() => localStorage),
        // onRehydrateStorage: () => {
        //   // Эта функция вызывается СРАЗУ ПОСЛЕ НАЧАЛА ГИДРАТАЦИИ
        //   // Возвращает функцию-коллбэк, которая вызывается ПОСЛЕ ЗАВЕРШЕНИЯ
        //   return (store) => {
        //     // `store` — это текущее состояние хранилища
        //     // Но важно: вы можете обновить его через `store.setState`
        //     if (store) {
        //       store.setState({ _hasHydrated: true });
        //     }
        //   };
        // },
        // partialize: (state) => {
        //   // Исключаем currentUserId из персиста
        //   const { currentUserId, ...persistedState } = state;
        //   return persistedState;
        // },
      }
    ),
    {
      name: "TabsStore", // имя в DevTools
      enabled: process.env.NODE_ENV === "development", // подключаем только в dev
    }
  )
);
