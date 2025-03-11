import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/app/lib/createAppSlice";

// import { Tenant } from "@/lib/definitions";
import { fetchTenants } from "@/app/lib/data";

export interface TenantState {
  id: string;
  name: string;
  active: boolean;
  description: string;
}
export interface TenantsState {
  tenants: TenantState[];
  selectedTenant: TenantState | null;
  deletedIds: string[];
}
const initialTenants: TenantState[] = []; //await fetchTenants();
const initialState: TenantsState = {
  tenants: initialTenants,
  selectedTenant: null,
  deletedIds: [],
};

export const tenantsSlice = createAppSlice({
  name: "tenants",
  initialState,
  selectors: {
    selectTenants: (state) => state.tenants,
    selectTenant: (state) => state.selectedTenant,
    selectDeletedIds: (state) => state.deletedIds,
  },
  reducers: (create) => ({
    addTenant: create.reducer((state, action: PayloadAction<TenantState>) => {
      // if (!state.tenants) {
      //   state.tenants = initialTenants;
      // }
      state.tenants.push(action.payload);
    }),
    deleteTenant: create.reducer((
      state,
      action: PayloadAction<{ index: number; id: string }>
    ) => {
      state.tenants.splice(action.payload.index, 1);
      state.deletedIds.push(action.payload.id);
    }),
    storeTenants: create.reducer((state, action: PayloadAction<TenantState[]>) => {
      console.log("is there payload data? : " + action.payload[0].name);
      if (action.payload.length !== 0) {
        state.tenants.splice(0, state.tenants.length, ...action.payload);
        state.deletedIds.splice(0, state.deletedIds.length);
      }
    }),
    fetchTenantsAsync: create.asyncThunk(
      async () => {
        const tenants: TenantState[] = await fetchTenants();
        // The value we return becomes the `fulfilled` action payload
        return tenants;
      },
      {
        // pending: (state) => {
        //   state.status = "loading";
        // },
        fulfilled: (state, action) => {
          // state.status = "idle";
          state.tenants = action.payload;
        },
        // rejected: (state) => {
        //   state.status = "failed";
        // },
      }
    ),
  }),
});

export const { addTenant, deleteTenant, storeTenants, fetchTenantsAsync } = tenantsSlice.actions;

export default tenantsSlice.reducer;
