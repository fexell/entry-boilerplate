"use client"

import { useState, useEffect, useRef } from "react"
import { Lock, ShieldCheck, CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react"

import TwoFactorSetupModal from "@/components/Auth/TwoFactorSetupModal"
import DisableTwoFactorModal from "@/components/Auth/DisableTwoFactorModal"
import RegenerateRecoveryCodesModal from "@/components/Auth/RegenerateRecoveryCodesModal"
import TextField from "@/components/UI/TextField"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

const SecuritySettingsPage = () => {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const twoFactorEnabled = Boolean(user?.twoFactorEnabled)

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false)

  const [twoFactorMessage, setTwoFactorMessage] = useState("")
  const twoFactorMessageTimeoutRef = useRef(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [passwordSaved, setPasswordSaved] = useState(false)

  const [showPasswords, setShowPasswords] = useState(false)

  const toggleVisibility = () => setShowPasswords((prev) => !prev)

  const successTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      clearTimeout(successTimeoutRef.current)
      clearTimeout(twoFactorMessageTimeoutRef.current)
    }
  }, [])

  const handleToggle2fa = () => {
    if (!twoFactorEnabled) {
      setIsSetupModalOpen(true)
      return
    }
    setIsDisableModalOpen(true)
  }

  const handle2faEnabled = () => {
    setUser({ ...user, twoFactorEnabled: true })
  }

  const handle2faDisabled = (message) => {
    setUser({ ...user, twoFactorEnabled: false })

    clearTimeout(twoFactorMessageTimeoutRef.current)
    setTwoFactorMessage(message || "Two-factor authentication disabled.")
    twoFactorMessageTimeoutRef.current = setTimeout(() => setTwoFactorMessage(""), 5000)
  }

  const handleRecoveryCodesRegenerated = (message) => {
    clearTimeout(twoFactorMessageTimeoutRef.current)
    setTwoFactorMessage(message || "Recovery codes regenerated successfully.")
    twoFactorMessageTimeoutRef.current = setTimeout(() => setTwoFactorMessage(""), 5000)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordErrors([])
    setPasswordSaved(false)
    clearTimeout(successTimeoutRef.current)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors(["New passwords don't match."])
      return
    }

    setIsPasswordSubmitting(true)

    try {
      await api("/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      setPasswordSaved(true)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })

      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = setTimeout(() => setPasswordSaved(false), 5000)
    } catch (err) {
      setPasswordErrors(err.errors?.length ? err.errors : [err.message])
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-100">Security</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Manage two-factor authentication and your password.
        </p>
      </div>

      {/* Two-factor authentication */}
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
          Two-factor authentication
        </h2>

        {twoFactorMessage && (
          <div className="flex items-start gap-3 bg-(--primary-color-10) border border-(--primary-color-20) rounded-lg px-4 py-3.5 mb-5 max-w-md">
            <CircleCheck className="w-4 h-4 text-(--primary-color) mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">{twoFactorMessage}</p>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-4 max-w-md">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                twoFactorEnabled ? "text-(--primary-color)" : "text-neutral-600"
              }`}
            />
            <div>
              <p className="text-sm text-neutral-200">
                {twoFactorEnabled ? "Enabled" : "Not enabled"}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {twoFactorEnabled
                  ? "Your account requires a code from your authenticator app at login."
                  : "Add an extra step to login using an authenticator app."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle2fa}
            className={`shrink-0 text-sm font-medium rounded-lg px-4 py-2 transition-colors ${
              twoFactorEnabled
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                : "bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950"
            }`}
          >
            {twoFactorEnabled ? "Disable" : "Enable"}
          </button>
        </div>

        {twoFactorEnabled && (
          <button
            type="button"
            onClick={() => setIsRegenerateModalOpen(true)}
            className="mt-3 text-sm text-neutral-500 hover:text-(--primary-color) transition-colors"
          >
            Regenerate recovery codes
          </button>
        )}
      </section>

      {/* Change password */}
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
          Change password
        </h2>

        {passwordSaved && (
          <div className="flex items-start gap-3 bg-() border border-(--primary-color-20) rounded-lg px-4 py-3.5 mb-5 max-w-md">
            <CircleCheck className="w-4 h-4 text-(--primary-color) mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">Password updated successfully.</p>
          </div>
        )}

        {passwordErrors.length > 0 && (
          <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5 mb-5 max-w-md">
            <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <ul className="text-sm text-red-300 space-y-1">
              {passwordErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
          <TextField
            id="currentPassword"
            label="Current password"
            icon={Lock}
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, currentPassword: e.target.value })
            }
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <TextField
            id="newPassword"
            label="New password"
            icon={Lock}
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <TextField
            id="confirmPassword"
            label="Confirm new password"
            icon={Lock}
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
            }
            placeholder="••••••••"
            autoComplete="new-password-confirm"
          />

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={
                isPasswordSubmitting ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
              className="flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color-disabled) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
            >
              {isPasswordSubmitting ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      <TwoFactorSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onEnabled={handle2faEnabled}
      />

      <DisableTwoFactorModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onDisabled={handle2faDisabled}
      />

      <RegenerateRecoveryCodesModal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        onRegenerated={handleRecoveryCodesRegenerated}
      />
    </div>
  )
}

export default SecuritySettingsPage
