"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  User, Globe, Folder, Calendar,
  AlertCircle, ExternalLink, ArrowRight,
  Pencil, Link as LinkIcon, X, Check,
  CircleAlert,
} from "lucide-react"
import clsx from "clsx"
import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"
import ProjectCard from "@/components/Project/ProjectCard"

// ─── Edit profile form ────────────────────────────────────────────────────────

function EditProfileForm({ profile, onSave, onCancel }) {
  const [firstName,    setFirstName]    = useState(profile.firstName ?? "")
  const [lastName,     setLastName]     = useState(profile.lastName  ?? "")
  const [bio,          setBio]          = useState(profile.bio       ?? "")
  const [websiteUrl,   setWebsiteUrl]   = useState(profile.websiteUrl ?? "")
  const [socialLinks,  setSocialLinks]  = useState(
    // Always show 4 slots
    Array.from({ length: 4 }, (_, i) => profile.socialLinks?.[i] ?? "")
  )
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState([])

  const user = useAuthStore((state) => state.user)

  const bioLimit = 160

  const originalLinks = Array.from({ length: 4 }, (_, i) => profile.socialLinks?.[i] ?? "")

  const isDirty =
    (firstName.trim() || null) !== (profile.firstName  ?? null) ||
    (lastName.trim()  || null) !== (profile.lastName   ?? null) ||
    (bio.trim()       || null) !== (profile.bio         ?? null) ||
    (websiteUrl.trim()|| null) !== (profile.websiteUrl  ?? null) ||
    socialLinks.some((url, i) => url !== originalLinks[i])

  const setSocialLink = (index, value) => {
    setSocialLinks((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setSaving(true)

    // Compute what actually changed
    const profileDirty =
      (firstName.trim() || null) !== (profile.firstName ?? null) ||
      (lastName.trim()  || null) !== (profile.lastName  ?? null) ||
      (bio.trim()       || null) !== (profile.bio        ?? null) ||
      (websiteUrl.trim()|| null) !== (profile.websiteUrl ?? null)

    const originalLinks = Array.from({ length: 4 }, (_, i) => profile.socialLinks?.[i] ?? "")
    const socialDirty = socialLinks.some((url, i) => url !== originalLinks[i])

    if (!profileDirty && !socialDirty) {
      setSaving(false)
      onCancel()
      return
    }

    try {
      const requests = []

      if (profileDirty) {
        requests.push(
          api("/account/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName:  firstName.trim()  || null,
              lastName:   lastName.trim()   || null,
              bio:        bio.trim()        || null,
              websiteUrl: websiteUrl.trim() || null,
            }),
          })
        )
      }

      if (socialDirty) {
        requests.push(
          api("/account/social-links", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              urls: socialLinks.map((u) => u.trim()).filter(Boolean),
            }),
          })
        )
      }

      await Promise.all(requests)

      onSave({
        ...profile,
        firstName:   firstName.trim()  || null,
        lastName:    lastName.trim()   || null,
        bio:         bio.trim()        || null,
        websiteUrl:  websiteUrl.trim() || null,
        socialLinks: socialLinks.map((u) => u.trim()).filter(Boolean),
      })
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {errors.length > 0 && (
        <div className="flex items-start gap-2.5 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-3">
          <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <ul className="text-sm text-red-300 space-y-0.5">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">
            First name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Felix"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
          />
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">
            Last name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Cervin"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">
          Bio
        </label>
        <textarea
          rows={3}
          maxLength={bioLimit}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the world a little about yourself…"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none resize-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
        />
        <p className="mt-1 text-xs text-neutral-600 text-right">
          {bio.length} / {bioLimit}
        </p>
      </div>

      {/* Website */}
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">
          Website
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
          />
        </div>
      </div>

      {/* Social links — 4 slots */}
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-1.5">
          Social links
        </label>
        <div className="space-y-2">
          {socialLinks.map((url, i) => (
            <div key={i} className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
              <input
                type="url"
                value={url}
                onChange={(e) => setSocialLink(i, e.target.value)}
                placeholder={`https://link${i + 1}.com`}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="flex items-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2 px-4 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-sm rounded-lg py-2 px-4 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProfileContent() {
  const { user: username } = useParams()
  const { user: authUser } = useAuthStore()

  const [profile,   setProfile]   = useState(null)
  const [projects,  setProjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [editing,   setEditing]   = useState(false)

  const isOwnProfile = authUser?.username === username

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [profileData, projectsData] = await Promise.all([
          api(`/user/${username}`, { method: "GET", silent: true }),
          api(`/projects/${username}`, { method: "GET", silent: true }),
        ])
        if (active) {
          setProfile(profileData)
          setProjects(projectsData ?? [])
          setLoading(false)
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load profile.")
          setLoading(false)
        }
      }
    }

    load()
    return () => { active = false }
  }, [username])

  useEffect(() => {
    if (profile) document.title = `${profile.username} – Audwio`
  }, [profile])

  if (loading) {
    return <div className="px-4 py-20 text-center text-neutral-500 text-sm">Loading profile…</div>
  }

  if (error || !profile) {
    return (
      <div className="px-4 py-20 text-center">
        <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-3" />
        <h1 className="text-base font-semibold text-neutral-200">User not found</h1>
        <p className="text-neutral-500 text-sm mt-1.5">{error || "This user doesn't exist."}</p>
      </div>
    )
  }

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username
  const joinedYear = new Date(profile.createdAt).getFullYear()

  return (
    <div className="flex-1 w-full px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">

        {/* ── Left: avatar + about / edit form ── */}
        <aside className="lg:sticky lg:top-6 space-y-5">

          {/* Avatar */}
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <div className="flex items-center justify-center lg:w-full lg:aspect-square max-lg:w-20 max-lg:h-20 rounded-xl bg-neutral-800 border border-neutral-700 shrink-0 text-neutral-400 overflow-hidden">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                : <User className="w-8 h-8" strokeWidth={1.5} />
              }
            </div>
            <div className="min-w-0 lg:w-full">
              <h1 className="text-xl font-semibold text-neutral-100 truncate">{displayName}</h1>
              <p className="text-sm text-neutral-500 mt-0.5">@{profile.username}</p>
            </div>
          </div>

          {/* Edit form or static info */}
          {editing ? (
            <EditProfileForm
              profile={profile}
              onSave={(updated) => { setProfile(updated); setEditing(false) }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-neutral-400 leading-relaxed">{profile.bio}</p>
              )}

              {/* Edit button — only own profile */}
              {isOwnProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 border border-neutral-700 hover:border-neutral-600 hover:bg-white/[0.03] text-neutral-300 text-sm font-medium rounded-lg py-2 px-3 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit profile
                </button>
              )}

              {/* Meta */}
              <div className="space-y-2 text-sm text-neutral-500">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  Joined {joinedYear}
                </span>
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-neutral-300 transition-colors min-w-0"
                  >
                    <Globe className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span className="truncate">{profile.websiteUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="w-3 h-3 opacity-40 shrink-0" />
                  </a>
                )}
              </div>

              {/* Social links */}
              {profile.socialLinks?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {profile.socialLinks.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors min-w-0"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                      <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>

        {/* ── Right: projects ── */}
        <main className="min-w-0">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-semibold text-neutral-200">Projects</h2>
            <div className="h-px flex-1 bg-neutral-800" />
            {projects.length > 6 && (
              <Link
                href={`/${profile.username}/projects`}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                View all {projects.length}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-800 py-16 text-center">
              <Folder className="w-7 h-7 text-neutral-700" />
              <p className="text-sm text-neutral-500">No public projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} showPrivacy={false} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  )
}
