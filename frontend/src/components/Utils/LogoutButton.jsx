"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

const LogoutButtonComponent = ({ className = "" }) => {
  const router = useRouter()
  const clearUser = useAuthStore((state) => state.clearUser)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await api("/auth/logout", { method: "POST" })
    } catch (err) {
      // Även om requesten failar (t.ex. token redan ogiltig) vill vi
      // fortfarande rensa lokalt state och skicka användaren till login.
      console.error("Logout request failed:", err)
    } finally {
      clearUser()
      setIsLoggingOut(false)
      router.push("/?from=logout&loggedOut=true")
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 text-sm text-neutral-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      {isLoggingOut ? "Logging out..." : "Log out"}
    </button>
  )
}

export default LogoutButtonComponent
