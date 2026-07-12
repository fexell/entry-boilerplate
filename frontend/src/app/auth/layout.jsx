"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import useAuthStore from '@/store/useAuthStore'

const AuthLayout = ({ children }) => {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated])

  if(isLoading) return null

  return (
    <>
      <div
        className="auth flex flex-col items-center justify-center min-h-screen max-h-screen bg-neutral-950">
        <Link
          href="/"
          className="absolute top-4 left-4 flex w-12 h-12 rounded-full justify-center items-center gap-2 tracking-widest text-neutral-950 bg-(--primary-color) hover:bg-(--primary-color-hover)/80">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="auth-container w-105">
          {children}
        </div>
      </div>
    </>
  )
}

export default AuthLayout
