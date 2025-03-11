// src/store/counterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TenantTestState {
  id: number;
  name: string;
  status: string;
  lastLogin: string;
}
export interface TenantsTestState {
  tenants: TenantTestState[];
  selectedId: number;
  deletedIds: number[];
}
const initialTenantsTest = [
  {
    id: 1,
    name: "Tenant 1",
    status: "Active",
    lastLogin: "2022-01-01",
  },
  {
    id: 2,
    name: "Tenant 2",
    status: "Active",
    lastLogin: "2022-01-01",
  },
  {
    id: 3,
    name: "Tenant 3",
    status: "Active",
    lastLogin: "2022-01-01",
  },
];
const initialState: TenantsTestState = {
  tenants: initialTenantsTest,
  selectedId: 1,
  deletedIds: [],
};

export const tenantsTestSlice = createSlice({
  name: "tenantsTest",
  initialState,
  selectors: {
    selectTenants: (state) => state.tenants,
    selectTenantId: (state) => state.selectedId,
    selectDeletedIds: (state) => state.deletedIds,
  },
  reducers: {
    addTenant: (state, action: PayloadAction<TenantTestState>) => {
        // if(!state.tenants) {
        //     state.tenants = initialTenantsTest;
        // }
      state.tenants.push(action.payload);
    },
    deleteTenant: (state, action: PayloadAction<{index:number; id:number;}>) => {
        state.tenants.splice(action.payload.index, 1);
        state.deletedIds.push(action.payload.id);
    },
  },
});

export const { addTenant, deleteTenant } = tenantsTestSlice.actions;

export default tenantsTestSlice.reducer;
