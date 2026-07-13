"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"

import Modal from "@/components/Utils/Modal"
import ConfirmCodeModal from "./ConfirmCodeModal"
import RecoveryCodesGrid from "@/components/Utils/RecoveryCodesGrid"
import api from "@/lib/api"

export default function RegenerateRecoveryCodesModal({ isOpen, onClose, onRegenerated }) {
  const [step, setStep] = useState("verify") // "verify" | "codes"
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [pendingMessage, setPendingMessage] = useState("")

  const resetState = () => {
    setStep("verify")
    setRecoveryCodes([])
    setPendingMessage("")
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleVerify = async (code) => {
    const data = await api("/2fa/recovery-codes/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    setRecoveryCodes(data.recoveryCodes || [])
    setPendingMessage(data.message || "Recovery codes regenerated successfully.")
    setStep("codes")
  }

  const handleDone = () => {
    onRegenerated?.(pendingMessage)
    resetState()
    onClose()
  }

  if (step === "codes") {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        icon={RefreshCw}
        title="Save your new recovery codes"
        description="Store these somewhere safe. Each code can only be used once, and your old codes no longer work."
      >
        <RecoveryCodesGrid codes={recoveryCodes} onDone={handleDone} />
      </Modal>
    )
  }

  return (
    <ConfirmCodeModal
      isOpen={isOpen}
      onClose={handleClose}
      icon={RefreshCw}
      title="Regenerate recovery codes"
      description="Your old recovery codes will stop working. Enter a code from your authenticator app to confirm."
      submitLabel="Regenerate codes"
      submittingLabel="Verifying..."
      codeMaxLength={6}
      requireLength={6}
      onSubmit={handleVerify}
    />
  )
}
