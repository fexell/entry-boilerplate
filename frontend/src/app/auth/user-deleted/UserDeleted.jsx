"use client"

import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"

const UserDeleted = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full" />
          {(process.env.NEXT_PUBLIC_APP_NAME).toUpperCase()}
        </div>

        <div className="mx-auto mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-(--primary-color)/10 border border-(--primary-color)/20">
          <CheckCircle2 className="w-5 h-5 text-(--primary-color)" />
        </div>

        <h1 className="text-2xl font-semibold text-neutral-100">
          Your account has been deleted
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          All your account data has been permanently removed. We&apos;re sorry to see you go.
        </p>

        <Link
          href="/"
          className="mt-8 w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2.5 transition-colors group"
        >
          Go to homepage
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Changed your mind?{" "}
          <Link
            href="/auth/signup"
            className="text-neutral-200 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-neutral-700"
          >
            Create a new account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default UserDeleted
