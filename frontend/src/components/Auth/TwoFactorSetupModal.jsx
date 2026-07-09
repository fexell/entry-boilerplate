"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Check, ShieldCheck } from "lucide-react"

import Modal from "@/components/Utils/Modal"
import CodeInputField from "@/components/Utils/CodeInputField"
import FormError from "@/components/Utils/FormError"
import RecoveryCodesGrid from "@/components/Utils/RecoveryCodesGrid"
import api from "@/lib/api"

// This one keeps its own step logic (loading/scan/error/recovery) because each step's
// content is genuinely different - but it still uses the same Modal shell and the same
// CodeInputField / FormError / RecoveryCodesGrid pieces as the other 2FA modals.
const TwoFactorSetupModal = ({ isOpen, onClose, onEnabled }) => {
  const [step, setStep] = useState("loading") // loading | scan | recovery | error
  const [setupInfo, setSetupInfo] = useState(null)
  const [code, setCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [error, setError] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    setStep("loading")
    setError(null)
    setCode("")

    const fetchSetup = async () => {
      try {
        const data = await api("/2fa/setup", { method: "POST" })
        setSetupInfo(data)
        setStep("scan")
      } catch (err) {
        setError(err.message)
        setStep("error")
      }
    }

    fetchSetup()
  }, [isOpen])

  const handleCopyKey = async () => {
    if (!setupInfo?.sharedKey) return
    await navigator.clipboard.writeText(setupInfo.sharedKey.replace(/\s/g, ""))
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    setIsVerifying(true)

    try {
      const { recoveryCodes } = await api("/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      setRecoveryCodes(recoveryCodes ?? [])
      setStep("recovery")
    } catch (err) {
      setError(err.errors?.length ? err.errors[0] : err.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDone = () => {
    onEnabled?.(recoveryCodes)
    onClose()
  }

  const title = step === "recovery" ? "Save your recovery codes" : "Set up two-factor authentication"

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="sectioned"
      maxWidth="max-w-md"
      title={title}
      showCloseButton={step !== "recovery"}
    >
      {step === "loading" && <p className="text-sm text-neutral-500 py-6 text-center">Generating your secret key...</p>}

      {step === "error" && (
        <div className="space-y-4">
          <FormError message={error} />
          <button type="button" onClick={onClose} className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
            Close
          </button>
        </div>
      )}

      {step === "scan" && setupInfo && (
        <div className="space-y-5">
          <p className="text-sm text-neutral-400">
            Scan this QR code with your authenticator app (e.g. Google Authenticator, 1Password, Authy).
          </p>

          <div className="flex justify-center bg-neutral-100 rounded-lg p-4">
            <QRCodeSVG value={setupInfo.authenticatorUri} size={176} />
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
              Or enter this key manually
            </p>
            <button
              type="button"
              onClick={handleCopyKey}
              className="w-full flex items-center justify-between gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 font-mono text-xs text-neutral-300 hover:border-neutral-700 transition-colors"
            >
              <span className="truncate">{setupInfo.sharedKey}</span>
              {keyCopied ? (
                <Check className="w-3.5 h-3.5 text-(--primary-color) shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              )}
            </button>
          </div>

          <form onSubmit={handleVerify} className="space-y-3">
            <CodeInputField
              id="totpCode"
              value={code}
              onChange={setCode}
              maxLength={6}
              placeholder="000000"
              autoFocus={false}
            />

            <FormError message={error} />

            <button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color-disabled) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
            >
              {isVerifying ? "Verifying..." : "Verify and enable"}
            </button>
          </form>
        </div>
      )}

      {step === "recovery" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 text-sm text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-(--primary-color) mt-0.5 shrink-0" />
            Store these somewhere safe. Each code can be used once if you lose access to your authenticator app.
          </div>

          <RecoveryCodesGrid codes={recoveryCodes} onDone={handleDone} />
        </div>
      )}
    </Modal>
  )
}

export default TwoFactorSetupModal
