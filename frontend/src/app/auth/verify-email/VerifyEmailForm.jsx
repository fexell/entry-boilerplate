"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react"
import api from "@/lib/api"

const VerifyEmailForm = () => {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const token = searchParams.get("token")

  const [status, setStatus] = useState("verifying") // "verifying" | "success" | "error"
  const [errors, setErrors] = useState([])

  useEffect(() => {
    const verify = async () => {
      if (!userId || !token) {
        setStatus("error")
        setErrors(["Verifieringslänken saknar nödvändig information."])
        return
      }

      try {
        await api("/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        })

        setStatus("success")
      } catch (err) {
        setStatus("error")
        setErrors(err.errors?.length ? err.errors : [err.message])
      }
    }

    verify()
  }, [userId, token])

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          {(process.env.NEXT_PUBLIC_APP_NAME).toUpperCase()}
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-100">
            {status === "verifying" && "Verify your email address"}
            {status === "success" && "Email verified"}
            {status === "error" && "Verification failed"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            {status === "verifying" && "Wait till we verify your email address."}
            {status === "success" && "Your account has been verified."}
            {status === "error" && "We could not verify your email address."}
          </p>
        </div>

        {status === "verifying" && (
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3.5">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <p className="text-sm text-neutral-400">Processing verification...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="flex items-start gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3.5">
              <CircleCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-emerald-300 font-medium">Done!</p>
                <p className="text-sm text-neutral-400 mt-0.5">
                  You can now log in to your account.
                </p>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2.5 transition-colors"
            >
              Go to log in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5">
              <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <ul className="text-sm text-red-300 space-y-1">
                {errors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              Do you need a new verification email?{" "}
              <Link
                href="/auth/resend-verification"
                className="text-neutral-200 hover:text-(--primary-color) transition-colors underline underline-offset-4 decoration-neutral-700"
              >
                Send a new one
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailForm
