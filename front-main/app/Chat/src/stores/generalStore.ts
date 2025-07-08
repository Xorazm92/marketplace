import { create } from "zustand"
import { persist } from "zustand/middleware"

interface GeneralState {
  isProfileSettingsModalOpen: boolean
  isCreateRoomModalOpen: boolean
  toggleProfileSettingsModal: () => void
  toggleCreateRoomModal: () => void
}

export const useGeneralStore = create<GeneralState>()(
  persist(
    (set) => ({
      isProfileSettingsModalOpen: false,
      isCreateRoomModalOpen: false,

      toggleProfileSettingsModal: () =>
        set((state) => ({
          isProfileSettingsModalOpen: !state.isProfileSettingsModalOpen,
        })),
      toggleCreateRoomModal: () =>
        set((state) => ({
          isCreateRoomModalOpen: !state.isCreateRoomModalOpen,
        })),
    }),
    {
      name: "general-store",
    }
  )
)
