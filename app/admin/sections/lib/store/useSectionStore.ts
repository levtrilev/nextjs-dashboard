"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Section, SectionForm } from "@/app/lib/definitions";
import { setIsMessageBoxOpen, setMessageBoxText } from "@/app/store/useDocumentStore";
import { createSection, deleteSection, updateSection } from "../sections-actions";
import { fetchRolesFormWithSectionSuperadmin } from "@/app/admin/roles/lib/roles-actions";

interface IInitialState {
  sections: SectionForm[];
}

interface IActions {
  fillSections: (sections: SectionForm[]) => void;
  addSection: (name: string, tenantId: string) => void;
  updSection: (id: string, newSection: SectionForm) => void;
  delSection: (sectionName: string, tenantId: string) => void;
}

interface ISectionState extends IInitialState, IActions {}

const initialState = {
  sections: [],
};

const sectionStore: StateCreator<
  ISectionState,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ]
> = (set) => ({
  ...initialState,
  fillSections: (sections: SectionForm[]) => {
    set({ sections }, false, "fillSections");
  },
  addSection: async (name: string, tenantId: string) => {
    try {
      const newSectionId = await createSection(name, tenantId);
      const newSection: Section = {
        id: newSectionId,
        name,
        tenant_id: tenantId,
      };
      set(
        (state: ISectionState) => {
          state.sections.push({...newSection, tenant_name: ""});
          state.sections.sort((a, b) => (a.name > b.name ? 1 : -1));
        },
        false,
        "addSection"
      );
    } catch (error) {
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
  updSection: (id: string, newSection: SectionForm) => {
    set(
      (state: ISectionState) => {
        updateSection(newSection);
        const index = state.sections.findIndex((s) => s.id === id);
        if (index !== -1) {
          state.sections[index] = newSection;
        }
      },
      false,
      "updSection"
    );
  },
  delSection: async (sectionName: string, tenantId: string): Promise<void> => {
    try {
      const roles = await fetchRolesFormWithSectionSuperadmin(sectionName, tenantId);
      if (roles.length > 0) {
        setMessageBoxText("Нельзя удалить Раздел, используемый в Роли. см. Роль: " + roles[0].name);
        setIsMessageBoxOpen(true);
        return;
      }
      await deleteSection(sectionName, tenantId);
      set(
        (state: ISectionState) => {
          const index = state.sections.findIndex((section) => section.name === sectionName);
          if (index !== -1) {
            state.sections.splice(index, 1);
            console.log("splice sections index: " + index);
          }
        },
        false,
        "delSection"
      );
    } catch (error) {
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
});

const useSectionStore = create<ISectionState>()(
  immer(
    devtools(
      persist(sectionStore, {
        name: "section-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sections: state.sections,
        }),
      })
    )
  )
);

// Экспорты селекторов и экшенов
export const useSections = () => useSectionStore((state) => state.sections);

export const fillSections = (sections: SectionForm[]) =>
  useSectionStore.getState().fillSections(sections);
export const addSection = (name: string, tenantId: string) =>
  useSectionStore.getState().addSection(name, tenantId);
export const updSection = (id: string, newSection: SectionForm) =>
  useSectionStore.getState().updSection(id, newSection);
export const delSection = async (sectionName: string, tenantId: string) =>
  useSectionStore.getState().delSection(sectionName, tenantId);
