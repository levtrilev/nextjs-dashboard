"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IInitialState {
  isMessageBoxOpen: boolean;
  messageBoxText: string;
  isOKButtonPressed: boolean;
  isCancelButtonPressed: boolean;
  isDocumentChanged: boolean;
}

interface IActions {
  setIsMessageBoxOpen: (isMessageBoxOpen: boolean) => void;
  setMessageBoxText: (messageBoxText: string) => void;
  setIsDocumentChanged: (isDocumentChanged: boolean) => void;
  setIsOKButtonPressed: (isOKButtonPressed: boolean) => void;
  setIsCancelButtonPressed: (isCancelButtonPressed: boolean) => void;
}

interface IMessageBoxState extends IInitialState, IActions {}

const initialState = {
  isMessageBoxOpen: false,
  messageBoxText: "",
  isOKButtonPressed: false,
  isCancelButtonPressed: false,
  isDocumentChanged: false,
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
    setIsOKButtonPressed: (isOKButtonPressed: boolean) => {
    set({ isOKButtonPressed: isOKButtonPressed }, false, "setIsOKButtonPressed");
  },
    setIsCancelButtonPressed: (isCancelButtonPressed: boolean) => {
    set({ isCancelButtonPressed: isCancelButtonPressed }, false, "setIsCancelButtonPressed");
  },
  setIsDocumentChanged: (isDocumentChanged: boolean) => {
    set(
      { isDocumentChanged: isDocumentChanged },
      false,
      "setIsDocumentChanged"
    );
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
          isDocumentChanged: state.isDocumentChanged,
          isOKButtonPressed: state.isOKButtonPressed,
          isCancelButtonPressed: state.isCancelButtonPressed,
        }),
      })
    )
  )
);

export const useIsMessageBoxOpen = () =>
  useMessageBoxStore((state) => state.isMessageBoxOpen);
export const useMessageBoxText = () =>
  useMessageBoxStore((state) => state.messageBoxText);
export const useIsDocumentChanged = () =>
  useMessageBoxStore((state) => state.isDocumentChanged);
export const useIsOKButtonPressed = () =>
  useMessageBoxStore((state) => state.isOKButtonPressed);
export const useIsCancelButtonPressed = () =>
  useMessageBoxStore((state) => state.isCancelButtonPressed);

export const setIsMessageBoxOpen = (isMessageBoxOpen: boolean) =>
  useMessageBoxStore.getState().setIsMessageBoxOpen(isMessageBoxOpen);
export const setMessageBoxText = (messageBoxText: string) =>
  useMessageBoxStore.getState().setMessageBoxText(messageBoxText);
export const setIsOKButtonPressed = (isOKButtonPressed: boolean) =>
  useMessageBoxStore.getState().setIsOKButtonPressed(isOKButtonPressed);
export const setIsCancelButtonPressed = (isCancelButtonPressed: boolean) =>
  useMessageBoxStore.getState().setIsCancelButtonPressed(isCancelButtonPressed);
export const setIsDocumentChanged = (isDocumentChanged: boolean) =>
  useMessageBoxStore.getState().setIsDocumentChanged(isDocumentChanged);
