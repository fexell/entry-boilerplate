"use client"

import Link from "next/link"
import { ShieldCheck, ArrowRight } from "lucide-react"

export default function Protected() {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* App name */}
        <div className="flex items-center justify-center gap-2 mt-8 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full" />
          {(process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY").toUpperCase()}
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-(--primary-color)/10 border border-(--primary-color)/20">
          <ShieldCheck className="w-5 h-5 text-(--primary-color)" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-neutral-100">
          Access restricted
        </h1>

        {/* Description */}
        <p className="mt-1.5 text-sm text-neutral-500">
          You tried to access a protected page. Please log in to continue.
        </p>

        {/* Login button */}
        <Link
          href="/auth/login"
          className="mt-8 w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2.5 transition-colors group"
        >
          Log in
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Secondary link */}
        <p className="mt-6 text-center text-sm text-neutral-500">
          Or continue browsing{" "}
          <Link
            href="/"
            className="text-neutral-200 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-neutral-700"
          >
            homepage
          </Link>
        </p>
      </div>
    </div>
  )
}
