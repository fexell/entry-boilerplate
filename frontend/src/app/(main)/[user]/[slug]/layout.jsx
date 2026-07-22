"use client"

import { useEffect } from "react"
import { useSubNav } from "@/context/SubNavContext"
import ProjectSubNav from "@/components/Project/ProjectSubNav"

export default function ProjectLayout({ children }) {
  const { setSubNav, clearSubNav } = useSubNav()

  useEffect(() => {
    setSubNav(<ProjectSubNav />)
    return () => clearSubNav()
  }, [setSubNav, clearSubNav])

  return <>{children}</>
}
