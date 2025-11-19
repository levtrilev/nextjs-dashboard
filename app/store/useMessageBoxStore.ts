"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IInitialState {
  isMessageBoxOpen: boolean;
  messageBoxText: string;
}

interface IActions {
  setIsMessageBoxOpen: (isMessageBoxOpen: boolean) => void;
  setMessageBoxText: (messageBoxText: string) => void;
}

interface IMessageBoxState extends IInitialState, IActions {}

const initialState = {
  isMessageBoxOpen: false,
  messageBoxText: "",
};

const messageBoxStore: StateCreator<
  IMessageBoxState,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ]
> = (set) => ({
  ...initialState,
  setIsMessageBoxOpen: (isMessageBoxOpen: boolean) => {
    set({ isMessageBoxOpen: isMessageBoxOpen }, false, "setIsMessageBoxOpen");
  },
  setMessageBoxText: (messageBoxText: string) => {
    set({ messageBoxText: messageBoxText }, false, "setMessageBoxText");
  },
});

const useMessageBoxStore = create<IMessageBoxState>()(
  immer(
    devtools(
      persist(messageBoxStore, {
        name: "messagebox-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          isMessageBoxOpen: state.isMessageBoxOpen,
          messageBoxText: state.messageBoxText,
        }),
      })
    )
  )
);

export const useIsMessageBoxOpen = () =>
  useMessageBoxStore((state) => state.isMessageBoxOpen);
export const useMessageBoxText = () =>
  useMessageBoxStore((state) => state.messageBoxText);


export const setIsMessageBoxOpen = (isMessageBoxOpen: boolean) =>
  useMessageBoxStore.getState().setIsMessageBoxOpen(isMessageBoxOpen);
export const setMessageBoxText = (messageBoxText: string) =>
  useMessageBoxStore.getState().setMessageBoxText(messageBoxText);
