import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/app/lib/createAppSlice";
import { auth } from "@/auth";
import { getCurrentSections } from "../../common-actions";

export interface UserSessionState {
  userName: string;
  currentSections: string;
}

const initialUserSession = async () => {
  const session = await auth();
  const email = session ? (session.user ? session.user.email : "") : "";
  const currentSections = await getCurrentSections(email as string);
  return {
    // user_id: "",
    userName: email as string,
    // user_tenant_id: "",
    // user_tenant_name: "",
    currentSections: currentSections,
  } as UserSessionState;
};

export const userSessionSlice = createAppSlice({
  name: "userSession",
  initialState: {
    userName: "",
    currentSections: "",
  } as UserSessionState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserSessionData.fulfilled, (state, action) => {
      state.userName = action.payload.userName;
      state.currentSections = action.payload.currentSections;
    });
  },
  selectors: {
    selectUserName: (state) => state.userName,
    selectCurrentSections: (state) => state.currentSections,
  },

});

// Создаем thunk для загрузки данных
export const fetchUserSessionData = createAsyncThunk(
  "userSession/fetchUserSessionData",
  async () => {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const currentSections = await getCurrentSections(email as string);
    return {
      userName: email as string,
      currentSections: currentSections,
    };
  }
);

// export const { addTenant, deleteTenant, storeTenants, fetchTenantsAsync } =
//   userSessionSlice.actions;

export default userSessionSlice.reducer;
