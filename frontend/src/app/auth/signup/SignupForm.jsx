"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, User, Lock, Eye, EyeOff, ArrowRight, CircleAlert, CircleCheck } from "lucide-react"


import TextField from "@/components/UI/TextField"
import Spinner from "@/components/UI/Spinner"
import SubmitButton from "@/components/UI/SubmitButton"

import api from "@/lib/api"

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    try {
      await api("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      setSuccess(true)
      setFormData({ email: "", username: "", password: "" })
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
    } finally {
      setIsSubmitting(false)
    }
  }

  return isSubmitting
  ? (
    <>
      <div className="flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    </>
  )
  : (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          {(process.env.NEXT_PUBLIC_APP_NAME).toUpperCase()}
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-100">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Set up access in a few seconds.
          </p>
        </div>

        {/* Success state replaces the form entirely */}
        {success ? (
          <>
            <div className="flex items-start mb-8 gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3.5">
              <CircleCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-emerald-300 font-medium">Account created</p>
                <p className="text-sm text-neutral-400 mt-0.5">
                  Check your inbox to verify your email before logging in.
                </p>
              </div>
            </div>
            <div>
              <Link
                href="/auth/login"
                className="mt-2 w-full flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-neutral-950 font-medium text-sm rounded-lg py-2.5 transition-colors group"
              >
                Log in
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </>
        ) : (
          <>
            {(errors.length > 0) && (
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
              <TextField
                id="email"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
              />

              {/* Username */}
              <TextField
                id="username"
                type="text"
                icon={User}
                placeholder="johndoe"
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                autoComplete="username"
              />

              {/* Password */}
              <div>
                <TextField
                  id="password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  label="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="password"
                />
                <p className="mt-3 text-xs text-neutral-600">
                  At least 12 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                </p>
              </div>

              <SubmitButton
                isLoading={isSubmitting}
                disabled={isSubmitting || (!formData.email || !formData.username || !formData.password)}
                icon={ArrowRight}>Sign up</SubmitButton>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-neutral-200 hover:text-(--primary-color) transition-colors underline underline-offset-4 decoration-neutral-700"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
