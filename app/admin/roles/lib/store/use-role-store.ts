"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Role, RoleForm } from "@/app/lib/definitions";
import {
  setIsMessageBoxOpen,
  setMessageBoxText,
} from "@/app/store/useDocumentStore";
import { createRole, deleteRole, updateRole } from "../roles-actions";
import { fetchUsersWithRoleAdmin } from "@/app/admin/users/lib/users-actions";

interface IInitialState {
  roles: RoleForm[];
}

interface IActions {
  fillRoles: (roles: RoleForm[]) => void;
  addRole: (
    name: string,
    description: string,
    tenantId: string,
    tenantName: string,
    sectionIds: string,
    sectionNames: string
  ) => void;
  updRole: (id: string, newRole: RoleForm) => void;
  delRole: (role: RoleForm) => void;
}

interface IRoleState extends IInitialState, IActions {}

const initialState = {
  roles: [],
};

const roleStore: StateCreator<
  IRoleState,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ]
> = (set) => ({
  ...initialState,
  fillRoles: (roles: RoleForm[]) => {
    set({ roles }, false, "fillRoles");
  },
  addRole: async (
    name: string,
    description: string,
    tenantId: string,
    tenantName: string,
    sectionIds: string,
    sectionNames: string
  ) => {
    try {
      const newRoleId = await createRole(
        name,
        description,
        tenantId,
        sectionIds,
        sectionNames
      );
      const newRole: Role = {
        id: newRoleId,
        name,
        description,
        tenant_id: tenantId,
        section_ids: sectionIds,
        section_names: "", // будет заполнено позже, если нужно
      };
      set(
        (state: IRoleState) => {
          state.roles.push({ ...newRole, tenant_name: tenantName });
          state.roles.sort((a, b) => (a.name > b.name ? 1 : -1));
        },
        false,
        "addRole"
      );
    } catch (error) {
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
  updRole: (id: string, newRole: RoleForm) => {
    set(
      (state: IRoleState) => {
        updateRole(newRole as Role);
        const index = state.roles.findIndex((r) => r.id === id);
        if (index !== -1) {
          state.roles[index] = newRole;
        }
      },
      false,
      "updRole"
    );
  },
  delRole: async (role: RoleForm): Promise<void> => {
    try {
            const users = await fetchUsersWithRoleAdmin(role.id, role.tenant_id); 
            if (users.length > 0) {
              setMessageBoxText(
                `Роль: ${role.name} \nНельзя удалить Роль, используемую Пользователем: ${users[0].email} в Организации: ${users[0].tenant_name}`
              );
              setIsMessageBoxOpen(true);
              return;
            }
      await deleteRole(role.id);
      set(
        (state: IRoleState) => {
          const index = state.roles.findIndex((role) => role.id === role.id);
          if (index !== -1) {
            state.roles.splice(index, 1);
            // console.log("splice roles index: " + index);
          }
        },
        false,
        "delRole"
      );
    } catch (error) {
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
});

const useRoleStore = create<IRoleState>()(
  immer(
    devtools(
      persist(roleStore, {
        name: "role-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          roles: state.roles,
        }),
      }),
      { name: "Roles" }
    )
  )
);

// Экспорты селекторов и экшенов
export const useRoles = () => useRoleStore((state) => state.roles);

export const fillRoles = (roles: RoleForm[]) =>
  useRoleStore.getState().fillRoles(roles);
export const addRole = (
  name: string,
  description: string,
  tenantId: string,
  tenantName: string,
  sectionIds: string,
  sectionNames: string
) =>
  useRoleStore
    .getState()
    .addRole(name, description, tenantId, tenantName, sectionIds, sectionNames);
export const updRole = (id: string, newRole: RoleForm) =>
  useRoleStore.getState().updRole(id, newRole);
export const delRole = async (role: RoleForm) =>
  useRoleStore.getState().delRole(role);

// (конец образца)
// // вот как определены типы Role и RoleForm
// export type Role = {
//   id: string;
//   name: string;
//   description: string;
//   tenant_id: string;
//   section_ids: string;
//   section_names: string;
// };
// export type RoleForm = {
//   id: string;
//   name: string;
//   description: string;
//   tenant_id: string;
//   tenant_name: string;
//   section_ids?: string;
//   section_names?: string;
// };
