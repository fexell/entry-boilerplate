"use client"

import { useState } from "react"
import { CircleAlert, Loader2, X, Eye, EyeOff } from "lucide-react"

const ConfirmPasswordModal = ({
  open,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  successMessage,
  onConfirm,
  onClose,
}) => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState("idle") // idle | loading | success
  const [errors, setErrors] = useState([])

  const close = () => {
    setPassword("")
    setShowPassword(false)
    setStatus("idle")
    setErrors([])
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("loading")
    setErrors([])

    try {
      await onConfirm(password)
      setStatus("success")
      setTimeout(close, 5000)
    } catch (err) {
      setStatus("idle")
      setErrors(err.errors?.length ? err.errors : [err.message || "Something went wrong."])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-lg p-6 relative">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300"
        >
          <X className="w-4 h-4" />
        </button>

        {status !== "success" ? (
          <>
            <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
            <p className="mt-1.5 text-sm text-neutral-500">{description}</p>

            <form onSubmit={handleSubmit} className="mt-5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {errors.length > 0 && (
                <div className="mt-3 flex items-start gap-2 bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-3">
                  <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <ul className="text-sm text-red-300 space-y-1">
                    {errors.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 rounded-lg py-2.5 text-sm font-medium text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "loading" || !password}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium bg-red-400 hover:bg-red-300 text-neutral-950 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === "loading" ? confirmingLabel : confirmLabel}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-2">
            <h2 className="text-lg font-semibold text-neutral-100">Done!</h2>
            <p className="mt-1.5 text-sm text-neutral-500">{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfirmPasswordModal
