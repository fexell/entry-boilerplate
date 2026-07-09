import { create } from 'zustand'
import api from '@/lib/api'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  setUser: (user) => set({ user, isAuthenticated: true, isInitialized: true }),
  clearUser: () => set({ user: null, isAuthenticated: false, isInitialized: true }),
  logout: async () => {
    try {
      await api('/auth/logout', { method: 'POST', silent: true })
    } finally {
      set({ user: null, isAuthenticated: false, isInitialized: true })
    }
  },
}))

export default useAuthStore
