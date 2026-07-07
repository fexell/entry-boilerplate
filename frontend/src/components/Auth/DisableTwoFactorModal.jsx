"use client"

import { useState } from "react"
import { X, ShieldOff, CircleAlert, KeyRound } from "lucide-react"

import api from "@/lib/api"

const DisableTwoFactorModal = ({ isOpen, onClose, onDisabled }) => {
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleClose = () => {
    setCode("")
    setError(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await api("/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      onDisabled()
      handleClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-neutral-600 hover:text-neutral-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-1.5">
          <ShieldOff className="w-4 h-4 text-(--primary-color)" />
          <h2 className="text-sm font-semibold text-neutral-100">Disable two-factor authentication</h2>
        </div>
        <p className="text-xs text-neutral-500 mb-5">
          Enter a code from your authenticator app, or a recovery code, to confirm.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="disable2faCode"
              className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              Verification code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                id="disable2faCode"
                type="text"
                inputMode="text"
                autoComplete="one-time-code"
                autoFocus
                placeholder="123456"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-sm text-red-300">
              <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !code}
              className="flex-1 flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
            >
              {isSubmitting ? "Disabling..." : "Disable 2FA"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors px-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DisableTwoFactorModal
