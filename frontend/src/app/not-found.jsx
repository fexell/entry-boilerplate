"use client"

import Link from "next/link"
import { TriangleAlert, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full" />
          {(process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY").toUpperCase()}
        </div>

        <div className="mx-auto mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20">
          <TriangleAlert className="w-5 h-5 text-red-500" />
        </div>

        <h1 className="text-2xl font-semibold text-neutral-100">
          Page not found
        </h1>

        <p className="mt-1.5 text-sm text-neutral-500">
          The page you were looking for doesn’t exist.
        </p>

        <Link
          href="/"
          className="mt-8 w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2.5 transition-colors group"
        >
          Go home
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
