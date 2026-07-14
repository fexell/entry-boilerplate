"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, ArrowRight, CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react"

import api from "@/lib/api"

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const missingLinkParams = !userId || !token

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])

    if (password !== confirmPassword) {
      setErrors(["Passwords do not match."])
      return
    }

    setIsSubmitting(true)

    try {
      await api("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          token,
          newPassword: password,
        }),
      })

      setSubmitted(true)
      setTimeout(() => router.push("/auth/login"), 2500)
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Eyebrow / brand mark */}
        {/* <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          {(process.env.NEXT_PUBLIC_APP_NAME).toUpperCase()}
        </div> */}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-100">
            Reset password
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Choose a new password for your account.
          </p>
        </div>

        {missingLinkParams ? (
          <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5">
            <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">
              This reset link is invalid or incomplete. Please request a new
              one.
            </p>
          </div>
        ) : submitted ? (
          <div className="flex items-start gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3.5">
            <CircleCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-300">
              Password reset successfully. Redirecting you to log in...
            </p>
          </div>
        ) : (
          <>
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
              <div>
                <label
                  htmlFor="password"
                  className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
                >
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                  >
                    {showPassword ? (
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
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color)/50 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2.5 mt-2 transition-colors group"
                disabled={isSubmitting || !password || !confirmPassword}
              >
                {isSubmitting ? "Resetting..." : "Reset password"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-neutral-500">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-neutral-200 hover:text-(--primary-color) transition-colors underline underline-offset-4 decoration-neutral-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
