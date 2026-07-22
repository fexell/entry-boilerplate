"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  User,
  Plus,
  X,
  Folder,
  ChevronRight,
  Loader2,
} from "lucide-react"
import clsx from "clsx"

import Logo from '../Utils/Logo'
import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"
import useMenuStore from "@/store/useMenuStore"

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      {
        icon: LayoutGrid,
        label: "Dashboard",
        id: "dashboard",
        href: "/",
      },
      {
        icon: Folder,
        label: "Projects",
        id: "projects",
        getHref: (user) => user?.username ? `/${user.username}/projects` : "/projects",
        href: "/projects",
        // signals that this item has a fetched child list
        hasProjects: true,
      },
    ],
  },
]

function ProjectSubList({ user, isExpanded }) {
  const pathname = usePathname()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const listRef = useRef(null)
  const [height, setHeight] = useState(0)

  // Fetch once when first expanded
  useEffect(() => {
    if (!isExpanded || fetched) return

    setLoading(true)
    api("/projects/me", { method: "GET", silent: true })
      .then((data) => {
        setProjects(data ?? [])
        setFetched(true)
      })
      .catch(() => setFetched(true))
      .finally(() => setLoading(false))
  }, [isExpanded, fetched])

  // Animate height
  useEffect(() => {
    if (listRef.current) {
      setHeight(isExpanded ? listRef.current.scrollHeight : 0)
    }
  }, [isExpanded, projects, loading])

  return (
    <div
      style={{ height, overflow: "hidden", transition: "height 200ms ease" }}
    >
      <div ref={listRef} className="pt-0.5 pb-1">
        {loading ? (
          <div className="flex items-center gap-2 pl-8 py-1.5 text-white/25 text-[12px]">
            <Loader2 size={12} className="animate-spin" />
            <span>Loading…</span>
          </div>
        ) : projects.length === 0 ? (
          <p className="pl-8 py-1.5 text-[12px] text-white/25">No projects yet.</p>
        ) : (
          projects.map((project) => {
            const href = `/${project.ownerUsername}/${project.slug}`
            const isActive = pathname === href
            return (
              <Link
                key={project.id}
                href={href}
                className={clsx(
                  "relative flex items-center gap-2 rounded-md pl-8 pr-2.5 py-[6px] text-[12.5px] transition-colors truncate",
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-white/40 hover:bg-white/[0.03] hover:text-white/70",
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-3.5 w-[2.5px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#00D4FF] to-[#0077FF]" />
                )}
                <Folder size={13} strokeWidth={1.8} className="shrink-0 opacity-60" />
                <span className="truncate">{project.name}</span>
              </Link>
            )
          })
        )}

        {/* Add project shortcut */}
        <Link
          href="/new"
          className="flex items-center gap-2 rounded-md pl-8 pr-2.5 py-[6px] text-[12.5px] text-white/25 hover:text-white/50 transition-colors"
        >
          <Plus size={13} strokeWidth={2} />
          <span>New project</span>
        </Link>
      </div>
    </div>
  )
}

export default function AsideMenu() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState({ projects: true })
  const { isOpen, close } = useMenuStore()
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const pathname = usePathname()

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === "Escape") close()
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, close])

  useEffect(() => {
    close()
  }, [pathname])

  if (!isInitialized || !isAuthenticated) return null

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={clsx(
          "fixed top-0 left-0 flex h-screen bg-[#0B0F14] font-sans z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <aside
          className={`flex flex-col border-r border-white/[0.06] bg-neutral-800 transition-all duration-200 ${
            collapsed ? "w-18" : "w-86"
          }`}
        >
          {/* Brand */}
          <div
            className={clsx(
              "flex h-[72px] py-2 shrink-0 items-center border-b border-white/[0.06]",
              collapsed ? "justify-center px-2" : "justify-between gap-2.5 px-4",
            )}
          >
            <div className="flex flex-row items-center">
              <Logo width={28} height={28} />
              {!collapsed && (
                <span className="ml-4 text-[15px] font-semibold tracking-tight text-white">
                  Audwio
                </span>
              )}
            </div>
            {!collapsed && (
              <button className="p-2 shrink-0 rounded-lg text-white hover:bg-neutral-700" onClick={close}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                {!collapsed && (
                  <div className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-white/25">
                    {section.label}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const href = item.getHref ? item.getHref(user) : item.href
                    const isActive = pathname === item.href
                    const isExpanded = !!expandedItems[item.id]

                    return (
                      <div key={item.id}>
                        <div
                          className={clsx(
                            "group relative flex items-center rounded-md py-[7px] text-[13.5px] transition-colors",
                            collapsed ? "justify-center px-0" : "w-full gap-2.5 px-2.5",
                            isActive
                              ? "bg-white/[0.06] text-white"
                              : "text-white/50 hover:bg-white/[0.03] hover:text-white/80",
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#00D4FF] to-[#0077FF]" />
                          )}

                          {/* Main nav link */}
                          <Link
                            href={href}
                            title={collapsed ? item.label : undefined}
                            className="flex items-center gap-2.5 flex-1 min-w-0"
                          >
                            <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                          </Link>

                          {/* Expand toggle — only for items with child projects */}
                          {!collapsed && item.hasProjects && (
                            <button
                              onClick={() => toggleExpanded(item.id)}
                              aria-label={isExpanded ? "Collapse projects" : "Expand projects"}
                              className="shrink-0 p-0.5 rounded text-white/20 hover:text-white/60 transition-colors"
                            >
                              <ChevronRight
                                size={13}
                                strokeWidth={2}
                                className={clsx(
                                  "transition-transform duration-200",
                                  isExpanded && "rotate-90",
                                )}
                              />
                            </button>
                          )}
                        </div>

                        {/* Project sub-list */}
                        {!collapsed && item.hasProjects && (
                          <ProjectSubList user={user} isExpanded={isExpanded} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* New project CTA */}
          {/* <div className="px-3 pb-3 border-b border-white/[0.06]">
            <Link
              href="/new"
              className={`flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#00D4FF] to-[#0077FF] py-2 text-[13px] font-medium text-white shadow-[0_0_20px_rgba(0,150,255,0.2)] transition-opacity hover:opacity-90 ${
                collapsed ? "px-0" : "px-3"
              }`}
            >
              <Plus size={15} strokeWidth={2.2} />
              {!collapsed && "New project"}
            </Link>
          </div> */}

          {/* Footer / user */}
          <footer className="flex flex-row w-full h-[57px] border-t border-white/[0.06]">
            <Link
              href={`/${user.username}`}
              className={clsx(
                "flex flex-1 px-3 py-3",
                collapsed ? "flex-col items-center gap-3" : "items-center gap-2",
              )}
            >
              <div className="flex justify-center items-center h-7 w-7 shrink-0 rounded-full text-white bg-white/10">
                {user.avatar ? null : <User size={16} strokeWidth={1.5} />}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-white/80">{user.username}</p>
                  <p className="truncate text-[11px] text-white/30">{user.email}</p>
                </div>
              )}
            </Link>
          </footer>
        </aside>
      </div>
    </>
  )
}
