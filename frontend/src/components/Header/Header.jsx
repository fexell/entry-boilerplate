"use client"

import Link from "next/link"
import { ArrowRight, UserPlus } from "lucide-react"

import LogoutButtonComponent from "../Utils/LogoutButton"
import SettingsButtonComponent from "../Utils/SettingsButton"

import useAuthStore from "@/store/useAuthStore"

export default function HeaderComponent() {
  const { isAuthenticated, isInitialized } = useAuthStore()

  return (
    <>
      {isInitialized && isAuthenticated ? <LoggedInHeader /> : <LoggedOutHeader />}
    </>
  )
}

const LoggedOutHeader = () => {
  return (
    <>
      <header
        id="MainHeader"
        className="sticky py-2 top-0 z-40 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2">
          {/* Brand mark — same eyebrow language as the login screen */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-(--primary-color) animate-pulse" />
              {(process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY").toUpperCase()}
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-400 transition-colors hover:text-(--primary-color)"
            >
              LOGIN
            </Link>
            <Link
              href="/auth/signup"
              className="flex items-center p-2 px-4 gap-2 rounded-full font-mono text-xs tracking-widest text-neutral-950 transition-colors bg-(--primary-color) hover:bg-(--primary-color-hover)"
            >
              <UserPlus className="w-4 h-4" />
              SIGN UP
            </Link>
          </div>
        </div>
      </header> 
    </>
  )
}

const LoggedInHeader = () => {
  return (
    <>
      <header
        id="MainHeader"
        className="sticky py-2 top-0 z-40 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2">
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
            <SettingsButtonComponent />
            <span className="mx-1.5 h-4 w-px bg-neutral-800" aria-hidden="true" />
            <LogoutButtonComponent />
          </div>
        </div>
      </header>
    </>
  )
}
