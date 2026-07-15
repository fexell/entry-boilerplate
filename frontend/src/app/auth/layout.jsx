"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { usePathname } from "next/navigation"

import useAuthStore from '@/store/useAuthStore'

export default function AuthLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  const paths = ["/auth/login", "/auth/register", "/auth/resend-verification"]

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
        className="auth flex flex-col items-center justify-center min-h-screen bg-neutral-950">
        <Link
          href={ paths.includes(pathname) ? "/auth" : "/auth/login" }
          className="absolute top-4 left-4 flex w-8 h-8 rounded-full justify-center items-center gap-2 tracking-widest text-neutral-950 bg-(--primary-color) hover:bg-(--primary-color-hover)/80">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="auth-container flex flex-col items-center w-full max-w-105 h-fit z-10">
          <Link className="flex justify-center items-center h-[80px]" href="/">
            <Image
              src="/entry-logo-icon.svg"
              alt="Logo"
              width={80}
              height={0}
              className="h-auto mb-8 hover:brightness-80 transition-all"
              priority
            />
          </Link>
          <div className="w-full max-w-105">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
