"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { User, ShieldCheck, Monitor, ArrowLeft, TriangleAlert } from "lucide-react"

import LogoutButton from "@/components/Utils/LogoutButton"

import { getBackHref } from '@/hooks/useBackHref'
import useAuthStore from "@/store/useAuthStore"

const navItems = [
  { href: "/settings", label: "Profile", icon: User },
  { href: "/settings/security", label: "Security", icon: ShieldCheck },
  { href: "/settings/sessions", label: "Sessions", icon: Monitor },
  { href: "/settings/danger", label: "Danger Zone", icon: TriangleAlert },
]

export default function SettingsLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [backHref, setBackHref] = useState("/")
  const { isAuthenticated, isInitialized, isLoggingOut } = useAuthStore()

  useEffect(() => {
    setBackHref(getBackHref(pathname))
  }, [pathname])

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoggingOut) {
      router.push("/auth/protected?from=guard")
    }
  }, [isAuthenticated, isInitialized, isLoggingOut, router])

  if(!isInitialized) return null

  if(!isAuthenticated && isLoggingOut) return null

  return (
    <div className="min-h-[calc(100vh-57px)] bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-10 py-4 sticky top-0 bg-neutral-950">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-500">
            <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
            <Link href="/" className="hover:underline text-white hover:text-(--primary-color)">{(process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY").toUpperCase()}</Link> — ACCOUNT SETTINGS
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 sm:gap-14">
          <aside className="sm:w-48 shrink-0">
            <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible -mx-1 sm:mx-0 px-1 sm:px-0 pb-1 sm:pb-0">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 shrink-0 px-3 py-2 rounded-lg text-sm border-l-2 transition-colors ${
                      isActive
                        ? "border-(--primary-color) bg-neutral-900 text-neutral-100"
                        : "border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-(--primary-color)" : "text-neutral-600"
                      }`}
                    />
                    {label}
                  </Link>
                )
              })}

              <div className="hidden sm:block h-px bg-neutral-800 my-2" />

              <LogoutButton className="flex items-center gap-2.5 shrink-0 px-3 py-2 rounded-lg text-sm border-l-2 border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50" />
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
