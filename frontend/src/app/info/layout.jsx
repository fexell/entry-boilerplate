"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

// Shared layout for /info and its sub-pages (e.g. /info/cookies).
// Uses router.back() rather than a fixed href so the button does the
// right thing whether you're on /info or one level deeper.
export default function InfoLayout({ children }) {
  const router = useRouter()

  return (
    <div className="min-h-[calc(100vh-57px)] max-h-auto bg-neutral-950">
      <div className="mx-auto w-full max-w-3xl px-6 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="group inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-(--primary-color) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)/60 rounded-sm"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      </div>
      {children}
    </div>
  )
}
