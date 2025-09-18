import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isProfileSettingsModalOpen: false,
  isCreateRoomModalOpen: false,
}

const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    toggleProfileSettingsModal: (state) => {
      state.isProfileSettingsModalOpen = !state.isProfileSettingsModalOpen
    },

    toggleCreateRoomModal: (state) => {
      if (process.env.NODE_ENV === "development") console.log("Working toggle modal")
      state.isCreateRoomModalOpen = !state.isCreateRoomModalOpen
    },
  },
})

export const {
  toggleProfileSettingsModal,
  toggleCreateRoomModal,
} = generalSlice.actions

export default generalSlice.reducer