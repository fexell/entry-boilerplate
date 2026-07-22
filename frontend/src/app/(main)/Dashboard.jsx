"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus, ArrowRight, LayoutGrid,
} from "lucide-react"
import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"
import ProjectCard from "@/components/Project/ProjectCard"

function StatCard({ label, value }) {
  return (
    <div className="border border-neutral-800 rounded-lg px-4 py-4">
      <p className="text-2xl font-semibold text-neutral-100">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
    </div>
  )
}

export default function DashboardContent() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Dashboard – Audwio"
  }, [])

  useEffect(() => {
    let active = true
    api("/projects/me", { method: "GET", silent: true })
      .then((data) => { if (active) { setProjects(data ?? []); setLoading(false) } })
      .catch(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const recentProjects  = projects.slice(0, 6)
  const publicCount     = projects.filter((p) => p.visibility === "public").length
  const privateCount    = projects.filter((p) => p.visibility === "private").length

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="flex-1 w-full px-4 py-12">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-sm text-neutral-500">{greeting()}</p>
          <h1 className="text-2xl font-semibold text-neutral-100 mt-0.5">
            {user?.username ?? "…"}
          </h1>
        </div>
        <Link
          href="/new"
          className="flex items-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2 px-4 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New project
        </Link>
      </div>

      {/* Stats */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatCard label="Total projects"   value={projects.length} />
          <StatCard label="Public"           value={publicCount} />
          <StatCard label="Private"          value={privateCount} />
        </div>
      )}

      {/* Recent projects */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-xs text-neutral-600">01</span>
          <h2 className="text-sm font-semibold text-neutral-200">Recent projects</h2>
          <div className="h-px flex-1 bg-neutral-800" />
          {projects.length > 6 && (
            <Link
              href={`/${user?.username}/projects`}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-600 text-sm">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-lg">
            <LayoutGrid className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No projects yet.</p>
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentProjects.map((project) => (
          <ProjectCard key={project.id} project={project} showUpdatedAt />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
