// store/chatUser/chatUserSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  id: number | undefined
  profile_img: string | null
  first_name: string
}

const initialState: UserState = {
  id: undefined,
  profile_img: null,
  first_name: "",
}

const chatUserSlice = createSlice({
  name: "chatUser",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      const { id, profile_img, first_name } = action.payload
      state.id = id
      state.profile_img = profile_img
      state.first_name = first_name
    },
    updateProfileImage(state, action: PayloadAction<string>) {
      state.profile_img = action.payload
    },
    updateUsername(state, action: PayloadAction<string>) {
      state.first_name = action.payload
    },
    clearUser(state) {
      state.id = undefined
      state.profile_img = null
      state.first_name = ""
    },
  },
})

export const {
  setUser,
  updateProfileImage,
  updateUsername,
  clearUser,
} = chatUserSlice.actions

export default chatUserSlice.reducer
