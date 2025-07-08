import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "../gql/graphql"

interface UserState {
  id: number | undefined
  profile_img: string | null
  first_name: string
  updateProfileImage: (image: string) => void
  updateUsername: (name: string) => void
  setUser: (user: User) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: undefined,
      first_name: "",
      profile_img: null,

      updateProfileImage: (image: string) => set({ profile_img: image }),
      updateUsername: (name: string) => set({ first_name: name }),
      setUser: (user) =>
        set({
          id: user.id || undefined,
          profile_img: user.profile_img,
          first_name: user.first_name,
        }),
    }),
    {
      name: "user-store",
    }
  )
)
