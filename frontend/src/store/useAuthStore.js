import { create } from "zustand"
import api from "@/lib/api"

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  isLoggingOut: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isInitialized: true,
      isLoggingOut: false, // viktigt: nollställs vid login
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      // OBS: isLoggingOut lämnas orörd
    }),

  logout: async () => {
    set({ isLoggingOut: true })

    try {
      await api("/auth/logout", { method: "POST", silent: true })
    } catch (err) {
      console.error("Logout request failed:", err)
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        // isLoggingOut förblir true tills redirect sker
      })
    }
  },
}))

export default useAuthStore
