"use client"

import { useEffect } from "react"
import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

export default function AuthProvider({ children }) {
  const { setUser, clearUser } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api("/user/me", { silent: true })
        setUser(user)
      } catch {
        clearUser()
      }
    }

    checkAuth()
  }, [setUser, clearUser])

  useEffect(() => {
    const handleExpired = () => clearUser()
    window.addEventListener("auth:expired", handleExpired)
    return () => window.removeEventListener("auth:expired", handleExpired)
  }, [clearUser])

  return children
}
