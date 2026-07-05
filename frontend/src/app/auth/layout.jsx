"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

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
      <div className="auth flex flex-col items-center justify-center min-h-screen max-h-screen bg-neutral-950">
        <div className="auth-container w-105">
          {children}
        </div>
      </div>
    </>
  )
}

export default AuthLayout
