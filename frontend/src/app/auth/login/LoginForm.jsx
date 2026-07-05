"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, ArrowRight, CircleAlert } from "lucide-react"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

const LoginForm = () => {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    try {
      const data = await api("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      setUser(data.user)
      router.push("/")

    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
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
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
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
                className="text-xs text-neutral-500 hover:text-amber-400 transition-colors"
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

          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
              />
              <span className="absolute inset-0 rounded border border-neutral-700 bg-neutral-900 peer-checked:bg-amber-400 peer-checked:border-amber-400 transition-colors" />
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
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/40 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2.5 mt-2 transition-colors group"
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
            className="text-neutral-200 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-neutral-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
