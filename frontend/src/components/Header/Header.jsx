"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import LogoutButtonComponent from "../Utils/LogoutButton"
import SettingsButtonComponent from "../Utils/SettingsButton"

import useAuthStore from "@/store/useAuthStore"

export default function HeaderComponent() {
  const { isAuthenticated, isInitialized } = useAuthStore()

  return (
    <header
      id="MainHeader"
      className="sticky top-0 z-40 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Brand mark — same eyebrow language as the login screen */}
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-500 transition-colors hover:text-neutral-300"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-(--primary-color) animate-pulse" />
          {(process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY").toUpperCase()}
        </Link>

        {/* Right-hand actions */}
        <div className="flex items-center gap-4">
          {!isAuthenticated && isInitialized && (
            <Link
              href="/auth/login"
              className="group flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
            >
              Log in
              <ArrowRight className="h-3.5 w-3.5 text-neutral-600 transition-all group-hover:translate-x-0.5 group-hover:text-(--primary-color)" />
            </Link>
          )}

          {isAuthenticated && isInitialized && (
            <div className="flex items-center gap-1 text-sm">
              <SettingsButtonComponent />
              <span className="mx-1.5 h-4 w-px bg-neutral-800" aria-hidden="true" />
              <LogoutButtonComponent />
            </div>
          )}

          {/* Reserve space while auth state is resolving, to avoid layout shift */}
          {!isInitialized && <div className="h-5 w-16" aria-hidden="true" />}
        </div>
      </div>
    </header>
  )
}
