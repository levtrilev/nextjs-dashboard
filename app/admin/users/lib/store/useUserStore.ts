"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { User, UserForm } from "@/app/lib/definitions";
import {
  setIsMessageBoxOpen,
  setMessageBoxText,
} from "@/app/store/useDocumentStore";
import { createUser, deleteUser, updateUser } from "../users-actions";

interface IInitialState {
  users: UserForm[];
}

interface IActions {
  fillUsers: (users: UserForm[]) => void;
  addUser: (
    email: string,
    password: string,
    isAdmin: boolean,
    tenantId: string,
    tenantName: string,
  ) => void;
  updUser: (id: string, newUser: UserForm) => void;
  delUser: (user: UserForm) => void;
}

interface IUserState extends IInitialState, IActions {}

const initialState = {
  users: [],
};

const userStore: StateCreator<
  IUserState,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ]
> = (set) => ({
  ...initialState,
  fillUsers: (users: UserForm[]) => {
    set({ users }, false, "fillUsers");
  },
  addUser: async (
    email: string,
    password: string,
    isAdmin: boolean,
    tenantId: string,
    tenantName: string,
  ) => {
    try {
      const newUserId = await createUser(
        email,
        password,
        tenantId,
        isAdmin,
      );
      const newUser: User = {
        id: newUserId,
        name: email,
        email,
        password,
        is_admin: isAdmin,
        is_superadmin: false,
        tenant_id: tenantId,
        role_ids: "",
      };
      set(
        (state: IUserState) => {
          state.users.push({ ...newUser, tenant_name: tenantName });
          state.users.sort((a, b) => (a.name > b.name ? 1 : -1));
        },
        false,
        "addUser"
      );
    } catch (error) {
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
  updUser: (id: string, newUser: UserForm) => {
    set(
      (state: IUserState) => {
        updateUser(newUser as User);
        const index = state.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          state.users[index] = newUser;
        }
      },
      false,
      "updUser"
    );
  },
  delUser: async (user: UserForm): Promise<void> => {
    try {
      await deleteUser(user.email);
      set(
        (state: IUserState) => {
          const index = state.users.findIndex((u) => u.email === user.email);
          if (index !== -1) {
            state.users.splice(index, 1);
          }
        },
        false,
        "delUser"
      );
    } catch (error) {
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
});

const useUserStore = create<IUserState>()(
  immer(
    devtools(
      persist(userStore, {
        name: "user-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          users: state.users,
        }),
      }),
      { name: "Users" }
    )
  )
);

// Экспорты селекторов и экшенов
export const useUsers = () => useUserStore((state) => state.users);

export const fillUsers = (users: UserForm[]) =>
  useUserStore.getState().fillUsers(users);
export const addUser = (
  email: string,
  password: string,
  isAdmin: boolean,
  tenantId: string,
  tenantName: string,
) =>
  useUserStore
    .getState()
    .addUser(email, password, isAdmin, tenantId, tenantName);
export const updUser = (id: string, newUser: UserForm) =>
  useUserStore.getState().updUser(id, newUser);
export const delUser = async (user: UserForm) =>
  useUserStore.getState().delUser(user);