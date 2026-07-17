"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { usePathname } from "next/navigation"

import Logo from "@/components/Utils/Logo"

import useAuthStore from '@/store/useAuthStore'

export default function AuthLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  const paths = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/resend-verification"]

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isInitialized])

  if(!isInitialized) return null
  if(isAuthenticated) return null

  return (
    <>
      <div
        className="auth flex flex-col items-center justify-center min-h-[calc(100vh-57px)] bg-neutral-950">
        <Link
          href={ paths.includes(pathname) ? "/auth" : "/auth/login" }
          className="absolute top-0 left-0 p-4 group inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-(--primary-color) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)/60 rounded-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>{ paths.includes(pathname) ? "Auth index" : "Login" }</span>
        </Link>
        <div className="auth-container flex flex-col items-center w-full max-w-105 h-fit z-10">
          <Logo link="/" linkClassName="hover:opacity-80 transition-opacity" width={80} height={80} />
          <div className="w-full max-w-105">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
