"use client";

import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Tenant, User } from "@/app/lib/definitions";
import { createTenant, deleteTenant } from "../lib/tenants-actions";
import { fetchUsersAdmin } from "../../users/lib/users-actions";
import { setIsMessageBoxOpen, setMessageBoxText } from "@/app/store/useDocumentStore"
interface IInitialState {
  tenants: Tenant[];
  tenantUsers: User[];
}

interface IActions {
  fillTenants: (tenants: Tenant[]) => void;
  addTenant: (name: string, description: string) => void;
  updTenant: (id: string, newTenant: Tenant) => void;
  delTenant: (tenant: Tenant) => void;
  getTenantUsers: (TenantId: string) => void;
}

interface ITenantState extends IInitialState, IActions {}

const initialState = {
  tenants: [],
  tenantUsers: [],
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
  delTenant: async (tenant: Tenant): Promise<void> => {
    try {
      await deleteTenant(tenant.name);
      set(
        (state: ITenantState) => {
          const index = state.tenants.findIndex(
            (tenant: Tenant) => tenant.id === tenant.id
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
      setMessageBoxText(String(error));
      setIsMessageBoxOpen(true);
    }
  },
  getTenantUsers: async (TenantId: string) => {
    const tenantUsers: User[] = await fetchUsersAdmin(TenantId);
    set({ tenantUsers: tenantUsers }, false, "getTenantUsers");
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
        }),
      }),
      { name: "Tenants" }
    )
  )
);

export const useTenants = () => useTenantStore((state) => state.tenants);

export const fillTenants = (tenants: Tenant[]) =>
  useTenantStore.getState().fillTenants(tenants);
export const addTenant = (name: string, description: string) =>
  useTenantStore.getState().addTenant(name, description);
export const updTenant = (id: string, newTenant: Tenant) =>
  useTenantStore.getState().updTenant(id, newTenant);
export const delTenant = async (tenant: Tenant) =>
  useTenantStore.getState().delTenant(tenant);
export const useTenantUsers = () =>
  useTenantStore((state) => state.tenantUsers);
export const getTenantUsers = (TenantId: string) =>
  useTenantStore.getState().getTenantUsers(TenantId);
