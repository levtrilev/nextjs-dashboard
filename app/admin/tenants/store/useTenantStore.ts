"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Tenant, User } from "@/app/lib/definitions";
import { createTenant, deleteTenant } from "../lib/tenants-actions";
import { fetchUsersAdmin } from "../../users/lib/users-actions";
// import { auth, getUser } from "@/auth";

// const session = await auth();
// const email = session ? (session.user ? session.user.email : "") : "";
// // const current_sections = await getCurrentSections(email as string);
// const user = await getUser(email as string) as User;
// const isSuperadmin = user.is_superadmin;
// const isAdmin = user.is_admin;
const isSuperadmin = true;

interface IInitialState {
  tenants: Tenant[];
  tenantUsers: User[];
  isMessageBoxOpen: boolean;
  messageBoxText: string;
}

interface IActions {
  fillTenants: (tenants: Tenant[]) => void;
  addTenant: (name: string, description: string) => void;
  updTenant: (id: string, newTenant: Tenant) => void;
  delTenant: (id: string, name: string) => void;
  getTenantUsers: (TenantId: string) => void;
  setIsMessageBoxOpen: (isMessageBoxOpen: boolean) => void;
  setMessageBoxText: (messageBoxText: string) => void;
}

interface ITenantState extends IInitialState, IActions {}

const initialState = {
  tenants: [],
  tenantUsers: [],
  isMessageBoxOpen: false,
  messageBoxText: "",
};

const tenantStore: StateCreator<
  ITenantState,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown]
  ]
> = (set) => ({
  ...initialState,
  fillTenants: async (tenants: Tenant[]) => {
    set({ tenants: tenants }, false, "fillTenants");
  },
  addTenant: async (name: string, description: string) => {
    const newTenantId = await createTenant(name, description);
    const newTenant: Tenant = {
      id: newTenantId,
      active: true,
      name: name,
      description: description,
    };
    set(
      (state: ITenantState) => {
        state.tenants.push(newTenant);
        state.tenants.sort((a, b) => (a.name > b.name ? 1 : -1));
      },
      false,
      "addTenant"
    );
  },
  updTenant: (id: string, newTenant: Tenant) => {},
  delTenant: async (id: string, name: string): Promise<void> => {
    try {
      await deleteTenant(name);
      set(
        (state: ITenantState) => {
          const index = state.tenants.findIndex(
            (tenant: Tenant) => tenant.id === id
          );
          if (index !== -1) {
            state.tenants.splice(index, 1);
            console.log("splice tenants index: " + index);
          }
        },
        false,
        "delTenant"
      );
    } catch (error) {
      set(
        { messageBoxText: String(error) },
        false,
        "delTenant/error-message"
      );
      set({ isMessageBoxOpen: true }, false, "delTenant/error");
    }
  },
  getTenantUsers: async (TenantId: string) => {
    const tenantUsers: User[] = await fetchUsersAdmin(TenantId);
    set({ tenantUsers: tenantUsers }, false, "getTenantUsers");
  },
  setIsMessageBoxOpen: (isMessageBoxOpen: boolean) => {
    set({ isMessageBoxOpen: isMessageBoxOpen }, false, "setIsMessageBoxOpen");
  },
  setMessageBoxText: (messageBoxText: string) => {
    set({ messageBoxText: messageBoxText }, false, "setMessageBoxText");
  },
});

const useTenantStore = create<ITenantState>()(
  immer(
    devtools(
      persist(tenantStore, {
        name: "tenant-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tenants: state.tenants,
          tenantUsers: state.tenantUsers,
          isMessageBoxOpen: state.isMessageBoxOpen,
          messageBoxText: state.messageBoxText,
        }),
      })
    )
  )
);

export const useTenants = () => useTenantStore((state) => state.tenants);
export const useIsMessageBoxOpen = () =>
  useTenantStore((state) => state.isMessageBoxOpen);
export const useMessageBoxText = () =>
  useTenantStore((state) => state.messageBoxText);

export const fillTenants = (tenants: Tenant[]) =>
  useTenantStore.getState().fillTenants(tenants);
export const addTenant = (name: string, description: string) =>
  useTenantStore.getState().addTenant(name, description);
export const updTenant = (id: string, newTenant: Tenant) =>
  useTenantStore.getState().updTenant(id, newTenant);
export const delTenant = async (id: string, name: string) =>
  useTenantStore.getState().delTenant(id, name);
export const useTenantUsers = () =>
  useTenantStore((state) => state.tenantUsers);
export const getTenantUsers = (TenantId: string) =>
  useTenantStore.getState().getTenantUsers(TenantId);
export const setIsMessageBoxOpen = (isMessageBoxOpen: boolean) =>
  useTenantStore.getState().setIsMessageBoxOpen(isMessageBoxOpen);
export const setMessageBoxText = (messageBoxText: string) =>
  useTenantStore.getState().setMessageBoxText(messageBoxText);

// export default useTenantStore;
