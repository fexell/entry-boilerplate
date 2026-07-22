"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Folder,
  Plus,
  AlertCircle,
  Search,
} from "lucide-react"
import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"
import ProjectCard from "@/components/Project/ProjectCard"

export default function ProjectsContent() {
  const { user: username } = useParams()
  const { user: authUser } = useAuthStore()

  const isOwnProfile = authUser?.username === username

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    let active = true

    async function load() {
      try {
        // Own profile: fetch all projects (including private) via /projects/me
        // Other profile: fetch only public projects via /projects/{username}
        const data = isOwnProfile
          ? await api("/projects/me", { method: "GET", silent: true })
          : await api(`/projects/${username}`, { method: "GET", silent: true })

        if (active) {
          setProjects(data ?? [])
          setLoading(false)
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load projects.")
          setLoading(false)
        }
      }
    }

    load()
    return () => { active = false }
  }, [username, isOwnProfile])

  useEffect(() => {
    document.title = `${username}/projects – Audwio`
  }, [username])

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description?.toLowerCase().includes(query.toLowerCase())
  )

  if (loading) {
    return (
      <div className="px-4 py-20 text-center text-neutral-500 text-sm">
        Loading projects…
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-20 text-center">
        <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-3" />
        <h1 className="text-base font-semibold text-neutral-200">Something went wrong</h1>
        <p className="text-neutral-500 text-sm mt-1.5">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full max-w-full mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-xs text-neutral-500 mb-1">{username}</p>
          <h1 className="text-2xl font-semibold text-neutral-100">Projects</h1>
        </div>

        {isOwnProfile && (
          <Link
            href="/new"
            className="flex items-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2 px-4 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            New project
          </Link>
        )}
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter projects…"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
          />
        </div>
      )}

      {/* List */}
      {filtered.length === 0 && query ? (
        <p className="text-sm text-neutral-500">
          No projects matching <span className="text-neutral-300">"{query}"</span>.
        </p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-800 rounded-lg">
          <Folder className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">
            {isOwnProfile ? "You don't have any projects yet." : "No public projects yet."}
          </p>
          {isOwnProfile && (
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Count */}
      {filtered.length > 0 && (
        <p className="mt-6 text-xs text-neutral-600">
          {query
            ? `${filtered.length} of ${projects.length} projects`
            : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        </p>
      )}

    </div>
  )
}
