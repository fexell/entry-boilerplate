"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import api from "@/lib/api"
import ConfirmPasswordModal from "@/components/Utils/ConfirmPasswordModal"

const RevokeAllSessionsButton = () => {
  const [open, setOpen] = useState(false)

  const handleConfirm = async (password) => {
    await api("/account/sessions/revoke-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-red-400 border border-red-400/20 hover:border-red-400/40 hover:bg-red-400/10 rounded-lg px-4 py-2.5 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Log out all other devices
      </button>

      <ConfirmPasswordModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Revoke all other devices"
        description="All sessions except the current one will be logged out. Please enter your password to confirm."
        confirmLabel="Revoke"
        confirmingLabel="Logging out..."
        successMessage="All sessions except the current one have been logged out."
      />
    </>
  )
}

export default RevokeAllSessionsButton
