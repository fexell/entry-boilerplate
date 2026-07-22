"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Settings, Trash2, AlertCircle } from "lucide-react"
import clsx from "clsx"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

// Shared context so child pages can read the project without re-fetching
import { createContext, useContext } from "react"

const ProjectContext = createContext(null)
export function useSettingsProject() {
  return useContext(ProjectContext)
}

const SIDEBAR_SECTIONS = [
  {
    label: null,
    items: [
      { label: "General",        href: "general",  icon: Settings },
    ],
  },
  {
    label: "Danger zone",
    items: [
      { label: "Delete project", href: "danger",   icon: Trash2, danger: true },
    ],
  },
]

export default function SettingsLayout({ children }) {
  const { user, slug } = useParams()
  const { user: authUser } = useAuthStore()
  const pathname = usePathname()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let active = true
    api(`/projects/${user}/${slug}`, { method: "GET", silent: true })
      .then((data) => { if (active) { setProject(data); setLoading(false) } })
      .catch((err) => { if (active) { setError(err.message); setLoading(false) } })
    return () => { active = false }
  }, [user, slug])

  useEffect(() => {
    if (project && authUser && authUser.username !== project.ownerUsername) {
      setError("You don't have permission to manage this project.")
    }
  }, [project, authUser])

  if (loading) {
    return <div className="px-4 py-20 text-center text-neutral-500 text-sm">Loading…</div>
  }

  if (error || !project) {
    return (
      <div className="px-4 py-20 text-center">
        <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-neutral-400">{error ?? "Project not found."}</p>
      </div>
    )
  }

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      <div className="flex-1 w-full px-4 py-12">

        {/* Page header */}
        <div className="mb-8">
          <p className="font-mono text-xs text-neutral-500 mb-1">{project.ownerUsername}</p>
          <h1 className="text-2xl font-semibold text-neutral-100">
            {project.name} — Settings
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-start">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6">
            {SIDEBAR_SECTIONS.map((section, si) => (
              <div key={si} className={si > 0 ? "mt-6" : ""}>
                {section.label && (
                  <p className="px-3 mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map(({ label, href, icon: Icon, danger }) => {
                    const to = `/${user}/${slug}/settings/${href}`
                    const isActive = pathname === to

                    return (
                      <Link
                        key={href}
                        href={to}
                        className={clsx(
                          "w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? danger
                              ? "bg-red-400/10 text-red-300"
                              : "bg-white/[0.06] text-white"
                            : danger
                              ? "text-red-500/70 hover:bg-red-400/5 hover:text-red-400"
                              : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300",
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </aside>

          {/* Page content */}
          <div className="min-w-0">
            {children}
          </div>

        </div>
      </div>
    </ProjectContext.Provider>
  )
}
