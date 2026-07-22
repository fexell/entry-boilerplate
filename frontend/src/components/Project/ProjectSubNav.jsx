"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Code, GitBranch, Settings, Files } from "lucide-react"
import clsx from "clsx"

const tabs = [
  { id: "files",    label: "Files",    icon: Files,      href: (u, s) => `/${u}/${s}` },
  { id: "versions", label: "Versions", icon: GitBranch, href: (u, s) => `/${u}/${s}/versions` },
  { id: "settings", label: "Settings", icon: Settings,  href: (u, s) => `/${u}/${s}/settings` },
]

export default function ProjectSubNav() {
  const { user, slug } = useParams()
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 px-6 overflow-x-auto">
      {tabs.map(({ id, label, icon: Icon, href }) => {
        const to = href(user, slug)

        // Active: exact match for "files" (root), startsWith for the rest
        const isActive =
          id === "files"
            ? pathname === to
            : pathname.startsWith(to)

        return (
          <Link
            key={id}
            href={to}
            className={clsx(
              "relative flex items-center gap-2 px-2 mr-8 py-2.5 text-sm whitespace-nowrap transition-colors",
              isActive
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
            {label}
            {/* Active indicator — sits on the bottom border of the header */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-gradient-to-r from-[#00D4FF] to-[#0077FF]" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
