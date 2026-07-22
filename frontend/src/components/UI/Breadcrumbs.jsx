"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { toTitleCase } from "@/components/Utils/StringsTransformation"

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = toTitleCase(decodeURIComponent(segment))

    return (
      <Link
        key={href}
        href={href}
        className="px-3 py-1 rounded-md hover:bg-neutral-800 hover:text-neutral-50 transition-colors"
      >
        {label}
      </Link>
    )
  })

  return (
    <nav className="flex items-center gap-2 text-neutral-400 ml-4 max-md:hidden">
      <Link
        href="/"
        className="px-3 py-1 rounded-md hover:bg-neutral-800 hover:text-neutral-50 transition-colors"
      >
        Home
      </Link>

      {crumbs.length > 0 && <span>/</span>}
      {crumbs.map((crumb, i) => (
        <div key={i} className="flex items-center gap-2">
          {(crumb)}
          {i < crumbs.length - 1 && <span>/</span>}
        </div>
      ))}
    </nav>
  )
}
