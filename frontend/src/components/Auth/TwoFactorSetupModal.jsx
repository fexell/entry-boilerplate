"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { X, Copy, Check, ShieldCheck, CircleAlert, KeyRound } from "lucide-react"

import api from "@/lib/api"

// Reusable 2FA enrollment modal.
// Usage: <TwoFactorSetupModal isOpen={open} onClose={...} onEnabled={(recoveryCodes) => ...} />
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-200">
            {step === "recovery" ? "Save your recovery codes" : "Set up two-factor authentication"}
          </h3>
          {step !== "recovery" && (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-600 hover:text-neutral-300 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-5 py-5">
          {step === "loading" && (
            <p className="text-sm text-neutral-500 py-6 text-center">Generating your secret key...</p>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 text-sm text-red-300">
                <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                {error}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
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
                <div>
                  <label
                    htmlFor="totpCode"
                    className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
                  >
                    Verification code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input
                      id="totpCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 tracking-widest placeholder:text-neutral-700 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 text-sm text-red-300">
                    <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

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

              <div className="grid grid-cols-2 gap-2 bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-sm text-neutral-300">
                {recoveryCodes.map((rc) => (
                  <span key={rc}>{rc}</span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDone}
                className="w-full bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TwoFactorSetupModal
