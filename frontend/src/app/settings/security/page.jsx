"use client"

import { useState } from "react"
import { Lock, ShieldCheck, CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

const SecuritySettingsPage = () => {
  const user = useAuthStore((state) => state.user)
  const twoFactorEnabled = Boolean(user?.twoFactorEnabled)

  const [is2faSubmitting, setIs2faSubmitting] = useState(false)
  const [twoFaError, setTwoFaError] = useState(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [passwordSaved, setPasswordSaved] = useState(false)

  const [visibleFields, setVisibleFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const toggleVisibility = (field) =>
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }))

  const handleToggle2fa = async () => {
    setTwoFaError(null)
    setIs2faSubmitting(true)

    try {
      if (twoFactorEnabled) {
        await api("/account/2fa/disable", { method: "POST" })
      } else {
        // Kick off the setup flow (e.g. navigate to a QR/enrollment step).
        await api("/account/2fa/setup", { method: "POST" })
      }
    } catch (err) {
      setTwoFaError(err.message)
    } finally {
      setIs2faSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordErrors([])
    setPasswordSaved(false)

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

        <div className="flex items-start justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-4 max-w-md">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                twoFactorEnabled ? "text-amber-400" : "text-neutral-600"
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
            disabled={is2faSubmitting}
            className={`shrink-0 text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed ${
              twoFactorEnabled
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:bg-neutral-800/50"
                : "bg-amber-400 hover:bg-amber-300 text-neutral-950 disabled:bg-amber-400/40"
            }`}
          >
            {is2faSubmitting ? "..." : twoFactorEnabled ? "Disable" : "Enable"}
          </button>
        </div>

        {twoFaError && (
          <div className="flex items-start gap-2.5 mt-3 max-w-md text-sm text-red-300">
            <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            {twoFaError}
          </div>
        )}
      </section>

      {/* Change password */}
      <section>
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
          Change password
        </h2>

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
          <div>
            <label
              htmlFor="currentPassword"
              className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              Current password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                id="currentPassword"
                type={visibleFields.currentPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => toggleVisibility("currentPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
                aria-label={visibleFields.currentPassword ? "Hide password" : "Show password"}
              >
                {visibleFields.currentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                id="newPassword"
                type={visibleFields.newPassword ? "text" : "password"}
                autoComplete="new-password"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => toggleVisibility("newPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
                aria-label={visibleFields.newPassword ? "Hide password" : "Show password"}
              >
                {visibleFields.newPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                id="confirmPassword"
                type={visibleFields.confirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => toggleVisibility("confirmPassword")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
                aria-label={visibleFields.confirmPassword ? "Hide password" : "Show password"}
              >
                {visibleFields.confirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={
                isPasswordSubmitting ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
              className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/40 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
            >
              {isPasswordSubmitting ? "Updating..." : "Update password"}
            </button>

            {passwordSaved && (
              <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                <CircleCheck className="w-4 h-4 text-amber-400" />
                Password updated
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

export default SecuritySettingsPage
