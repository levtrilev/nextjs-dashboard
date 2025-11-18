import { create, type StateCreator } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Tenant } from "@/app/lib/definitions";
import { createTenant, deleteTenant } from '../lib/tenants-actions';
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
}

interface IActions {
  fillTenants: (tenants: Tenant[]) => void;
  // addTenant: (newTenant: Tenant) => void;
  addTenant: (name: string, description: string) => void;
  updTenant: (id: string, newTenant: Tenant) => void;
  delTenant: (id: string, name: string) => void;
}

interface ITenantState extends IInitialState, IActions { }

const initialState = {
  tenants: [],
}



const tenantStore: StateCreator<
  ITenantState,
  [
    ['zustand/immer', never],
    ['zustand/devtools', never],
    ['zustand/persist', unknown]
  ]
> = ((set) => ({
  ...initialState,
  fillTenants: async (tenants: Tenant[]) => {
    set({ tenants: tenants }, false, "fillTenants");
  },
  // fetchTenants: async (tenant_id: string) => {
  //   set({ isLoading: true }, false, "fetchTenants");
  //   const items = isSuperadmin ? await fetchTenantsSuperadmin() : await fetchTenantsAdmin(tenant_id);
  //   set({ tenants: items }, false, "fetchTenants/success");
  // },
  addTenant: async (name: string, description: string) => {
    const newTenantId = await createTenant(name, description);
    const newTenant: Tenant = { id: newTenantId, active: true, name: name, description: description };
    set((state: ITenantState) => {
      // const index = state.tenants.findIndex((tenant: Tenant) => tenant.id === id);
      // if (index !== -1) {
        state.tenants.push(newTenant);
        // console.log("splice tenants index: " + index);
      // }
    }, false, "addTenant");
  },
  updTenant: (id: string, newTenant: Tenant) => { },
  delTenant: (id: string, name: string) => {
    deleteTenant(name);
    set((state: ITenantState) => {
      const index = state.tenants.findIndex((tenant: Tenant) => tenant.id === id);
      if (index !== -1) {
        state.tenants.splice(index, 1);
        console.log("splice tenants index: " + index);
      }
    }, false, "delTenant");
  },
  // deleteTenant: (id: string) => {
  //   set(
  //     (state: ITodoState) => {
  //       const todo = state.todos.find((todo) => todo.id === id);
  //       if (todo) {
  //         todo.completed = !todo.completed;
  //       }
  //     },
  //     false,
  //     "completeTodo"
  //   );
  // },
  // deleteTodo: (id: number) => {
  //   set(
  //     (state: ITodoState) => {
  //       const index = state.todos.findIndex((todo: ITodo) => todo.id === id);
  //       if (index !== -1) {
  //         state.todos.splice(index, 1);
  //       }
  //     },
  //     false,
  //     "deleteTodo"
  //   );
  // },
}));

const useTenantStore = create<ITenantState>()(
  immer(
    devtools(
      persist(tenantStore,
        {
          name: 'tenant-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({ tenants: state.tenants })
        })
    )
  )
);

export const useTenants = () => useTenantStore((state) => state.tenants);
export const fillTenants = (tenants: Tenant[]) => useTenantStore.getState().fillTenants(tenants);
export const addTenant = (name: string, description: string) => useTenantStore.getState().addTenant(name, description);
export const updTenant = (id: string, newTenant: Tenant) => useTenantStore.getState().updTenant(id, newTenant);
export const delTenant = (id: string, name: string) => useTenantStore.getState().delTenant(id, name);
