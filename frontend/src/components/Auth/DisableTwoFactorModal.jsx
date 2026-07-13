"use client"

import { ShieldOff } from "lucide-react"

import ConfirmCodeModal from "./ConfirmCodeModal"
import api from "@/lib/api"

export default function DisableTwoFactorModal({ isOpen, onClose, onDisabled }) {
  const handleSubmit = async (code) => {
    await api("/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    onDisabled()
    onClose()
  }

  return (
    <ConfirmCodeModal
      isOpen={isOpen}
      onClose={onClose}
      icon={ShieldOff}
      title="Disable two-factor authentication"
      description="Enter a code from your authenticator app, or a recovery code, to confirm."
      submitLabel="Disable 2FA"
      submittingLabel="Disabling..."
      numericOnly={false}
      onSubmit={handleSubmit}
    />
  )
}
