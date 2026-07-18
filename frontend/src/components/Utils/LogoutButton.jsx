"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

import useAuthStore from "@/store/useAuthStore"

export default function LogoutButtonComponent({ className = "" }) {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const isLoggingOut = useAuthStore((s) => s.isLoggingOut)

  const handleLogout = async () => {
    await logout()
    router.push("/auth/logged-out?from=logout")
    toast.success("Logged out.")
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center py-1.5 gap-2 text-sm text-neutral-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      {isLoggingOut ? "Logging out..." : "Log out"}
    </button>
  )
}
