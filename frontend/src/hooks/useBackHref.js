"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

const LAST_PAGE_KEY = "lastNonSettingsPath"
const FALLBACK_HREF = "/"

export const useTrackLastPage = () => {
  const pathname = usePathname()

  useEffect(() => {
    if(!pathname.startsWith("/settings")) {
      sessionStorage.setItem(LAST_PAGE_KEY, pathname)
    }
  }, [pathname])
}

export const getBackHref = () => {
  if(typeof window === "undefined") return FALLBACK_HREF

  return sessionStorage.getItem(LAST_PAGE_KEY) ?? FALLBACK_HREF
}