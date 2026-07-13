"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, CircleAlert, CircleCheck } from "lucide-react"

import TextField from "@/components/UI/TextField"

import api from "@/lib/api"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setIsSubmitting(true)

    try {
      await api("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      // Backend svarar alltid generiskt (oavsett om mailet finns) för
      // att undvika user enumeration.
      setSubmitted(true)
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
            Forgot password
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="flex items-start gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3.5">
            <CircleCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-300">
              If an account with that email exists, a password reset link
              has been sent.
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
              <TextField
                id="email"
                label="Email"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color-disabled) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2.5 mt-2 transition-colors group"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
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
