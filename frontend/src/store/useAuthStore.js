import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  setUser: (user) => set({ user, isAuthenticated: true, isInitialized: true }),
  clearUser: () => set({ user: null, isAuthenticated: false, isInitialized: true }),
}))

export default useAuthStore
