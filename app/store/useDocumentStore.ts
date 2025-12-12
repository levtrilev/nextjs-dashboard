"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { MessageBox, SectionForm, User } from "../lib/definitions";

interface IInitialState {
  messageBox: MessageBox;
  isDocumentChanged: boolean;
  allTags: string[];
  documentTenantId: string;
  sessionUser: User;
  userSections: SectionForm[];
}

interface IActions {
  setIsMessageBoxOpen: (isMessageBoxOpen: boolean) => void;
  setMessageBoxText: (messageBoxText: string) => void;
  setIsDocumentChanged: (isDocumentChanged: boolean) => void;
  setIsOKButtonPressed: (isOKButtonPressed: boolean) => void;
  setIsCancelButtonPressed: (isCancelButtonPressed: boolean) => void;
  setIsShowMessageBoxCancel: (isShowMessageBoxCancel: boolean) => void;
  setAllTags: (tags: string[] | null) => void;
  addAllTags: (newTags: string[] | null) => void;
  setDocumentTenantId: (docTenantId: string) => void;
  setSessionUser: (user: User) => void;
  setUserSections: (sections: SectionForm[]) => void;
}

interface IDocumentState extends IInitialState, IActions {}

const initialState = {
  messageBox: {
    isMessageBoxOpen: false,
    messageBoxText: "",
    isOKButtonPressed: false,
    isCancelButtonPressed: false,
    isShowMessageBoxCancel: false,
  },
  isDocumentChanged: false,
  allTags: [],
  documentTenantId: "",
  sessionUser: {} as User,
  userSections: [] as SectionForm[],
};

const messageBoxStore: StateCreator<
  IDocumentState,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ]
> = (set) => ({
  ...initialState,
  setIsMessageBoxOpen: (isMessageBoxOpen) =>
    set(
      (state) => ({
        messageBox: { ...state.messageBox, isMessageBoxOpen },
      }),
      false,
      "setIsMessageBoxOpen"
    ),
  setMessageBoxText: (messageBoxText) =>
    set(
      (state) => ({
        messageBox: { ...state.messageBox, messageBoxText },
      }),
      false,
      "setMessageBoxText"
    ),
  setIsOKButtonPressed: (isOKButtonPressed) =>
    set(
      (state) => ({
        messageBox: { ...state.messageBox, isOKButtonPressed },
      }),
      false,
      "setIsOKButtonPressed"
    ),

  setIsCancelButtonPressed: (isCancelButtonPressed) =>
    set(
      (state) => ({
        messageBox: { ...state.messageBox, isCancelButtonPressed },
      }),
      false,
      "setIsCancelButtonPressed"
    ),

  setIsShowMessageBoxCancel: (isShowMessageBoxCancel) =>
    set(
      (state) => ({
        messageBox: { ...state.messageBox, isShowMessageBoxCancel },
      }),
      false,
      "setIsShowMessageBoxCancel"
    ),
  setIsDocumentChanged: (isDocumentChanged: boolean) => {
    set(
      { isDocumentChanged: isDocumentChanged },
      false,
      "setIsDocumentChanged"
    );
  },
  setAllTags: (tags) => {
    if (tags) set({ allTags: tags }), false, "setAllTags";
  },
  // addAllTags: (newTags) => set((state) => ({ allTags: [...state.allTags, ...newTags] }), false, "addAllTags"),
  addAllTags: (newTags: string[] | null) => {
    if (newTags) {
      set(
        (state) => ({
          allTags: Array.from(new Set([...state.allTags, ...newTags])).sort(
            (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })
          ),
        }),
        false,
        "addAllTags"
      );
    }
  },
  setDocumentTenantId: (docTenantId: string) => {
    set({ documentTenantId: docTenantId }, false, "setDocumentTenantId");
  },
  setSessionUser: (user: User) => {
    set({ sessionUser: user }, false, "setSessionUser");
  },
  setUserSections: (sections: SectionForm[]) => {
    set({ userSections: sections }, false, "setUserSections");
  },
});

export const useDocumentStore = create<IDocumentState>()(
  immer(
    devtools(
      persist(messageBoxStore, {
        name: "messagebox-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          messageBox: state.messageBox,
          isDocumentChanged: state.isDocumentChanged,
          allTags: state.allTags,
          documentTenantId: state.documentTenantId,
          sessionUser: state.sessionUser,
          userSections: state.userSections
        }),
      }),
      { name: "Document" }
    )
  )
);

export const useMessageBox = () =>
  useDocumentStore((state) => state.messageBox);
export const useIsDocumentChanged = () =>
  useDocumentStore((state) => state.isDocumentChanged);

export const setIsMessageBoxOpen = (isMessageBoxOpen: boolean) =>
  useDocumentStore.getState().setIsMessageBoxOpen(isMessageBoxOpen);
export const setMessageBoxText = (messageBoxText: string) =>
  useDocumentStore.getState().setMessageBoxText(messageBoxText);
export const setIsOKButtonPressed = (isOKButtonPressed: boolean) =>
  useDocumentStore.getState().setIsOKButtonPressed(isOKButtonPressed);
export const setIsCancelButtonPressed = (isCancelButtonPressed: boolean) =>
  useDocumentStore.getState().setIsCancelButtonPressed(isCancelButtonPressed);
export const setIsShowMessageBoxCancel = (isShowMessageBoxCancel: boolean) =>
  useDocumentStore.getState().setIsShowMessageBoxCancel(isShowMessageBoxCancel);
export const setIsDocumentChanged = (isDocumentChanged: boolean) =>
  useDocumentStore.getState().setIsDocumentChanged(isDocumentChanged);
