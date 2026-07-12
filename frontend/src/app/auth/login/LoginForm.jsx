"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, ArrowRight, CircleAlert, KeyRound } from "lucide-react"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"
import { getDeviceFingerprint } from "@/components/Utils/DeviceFingerprint"
import TextField from "@/components/UI/TextField"

const REMEMBERED_EMAIL_KEY = "email"

const LoginForm = () => {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  const [isRememberMe, setIsRememberMe] = useState(false)

  // 2FA challenge step
  const [twoFactorToken, setTwoFactorToken] = useState("")
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFaCode, setTwoFaCode] = useState("")
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    try {
      const deviceFingerprint = await getDeviceFingerprint()

      const data = await api("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deviceFingerprint,
        }),
      })

      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true)
        setTwoFactorToken(data.twoFactorToken)
        return
      }

      setUser(data.user)
      router.push("/")
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify2fa = async (e) => {
    e.preventDefault()
    setErrors([])
    setIsVerifying(true)

    try {
      const payload = {
        TwoFactorToken: twoFactorToken,
        Code: twoFaCode,
        IsRecoveryCode: useRecoveryCode,
      }

      const data = await api("/auth/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      setUser(data.user)
      router.push("/")
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
    } finally {
      setIsVerifying(false)
    }
  }

  // Runs once on mount only — loads a previously remembered email, if any.
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)

    if (savedEmail) {
      setIsRememberMe(true)
      setFormData((prev) => ({ ...prev, email: savedEmail }))
    }
  }, [])

  const handleEmailChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, email: value }))

    // Keep localStorage in sync live while remember-me is checked,
    // so the email is remembered even if the user never submits.
    if (isRememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, value)
    }
  }

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked
    setIsRememberMe(checked)

    if (checked) {
      // Remember immediately, even before the user finishes typing an email.
      localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.email)
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    }
  }

  if (requiresTwoFactor) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
            <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
            {(process.env.NEXT_PUBLIC_APP_NAME).toUpperCase()}
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-neutral-100">
              Two-factor authentication
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              {useRecoveryCode
                ? "Enter one of your recovery codes."
                : "Enter the 6-digit code from your authenticator app."}
            </p>
          </div>

          {errors.length > 0 && (
            <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5 mb-5">
              <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <ul className="text-sm text-red-300 space-y-1">
                {errors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleVerify2fa}>
            <div>
              <label
                htmlFor="twoFaCode"
                className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
              >
                {useRecoveryCode ? "Recovery code" : "Verification code"}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  id="twoFaCode"
                  type="text"
                  inputMode={useRecoveryCode ? "text" : "numeric"}
                  autoComplete="one-time-code"
                  maxLength={useRecoveryCode ? undefined : 6}
                  placeholder={useRecoveryCode ? "xxxxx-xxxxx" : "000000"}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 tracking-widest placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                  value={twoFaCode}
                  onChange={(e) =>
                    setTwoFaCode(
                      useRecoveryCode ? e.target.value : e.target.value.replace(/\D/g, "")
                    )
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color-disabled) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2.5 mt-2 transition-colors group"
              disabled={isVerifying || !twoFaCode || (!useRecoveryCode && twoFaCode.length !== 6)}
            >
              {isVerifying ? "Verifying..." : "Verify"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setUseRecoveryCode((v) => !v)
              setTwoFaCode("")
              setErrors([])
            }}
            className="mt-6 w-full text-center text-sm text-neutral-500 hover:text-(--primary-color) transition-colors"
          >
            {useRecoveryCode ? "Use authenticator code instead" : "Use a recovery code instead"}
          </button>

          <button
            type="button"
            onClick={() => {
              setRequiresTwoFactor(false)
              setTwoFactorToken("")
              setTwoFaCode("")
              setUseRecoveryCode(false)
              setErrors([])
            }}
            className="mt-3 w-full text-center text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          ENTRY
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-100">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Log in to continue to your account.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5 mb-5">
            <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <ul className="text-sm text-red-300 space-y-1">
              {errors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <TextField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleEmailChange}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-neutral-500 hover:text-(--primary-color) transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isRememberMe}
                onChange={handleRememberMeChange}
              />
              <span className="absolute inset-0 rounded border border-neutral-700 bg-neutral-900 peer-checked:bg-(--primary-color) peer-checked:border-(--primary-color) transition-colors" />
              <svg
                className="relative w-2.5 h-2.5 text-neutral-950 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6L4.5 8.5L10 3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
              Remember me
            </span>
          </label>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color-disabled) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2.5 mt-2 transition-colors group"
            disabled={isSubmitting || (!formData.email || !formData.password)}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-neutral-200 hover:text-(--primary-color) transition-colors underline underline-offset-4 decoration-neutral-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
