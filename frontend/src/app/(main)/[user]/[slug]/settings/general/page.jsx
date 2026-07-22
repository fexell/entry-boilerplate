"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Globe, Lock, Tag, FileText, ChevronDown, CircleAlert, CheckCircle2 } from "lucide-react"
import clsx from "clsx"

import api from "@/lib/api"
import { useSettingsProject } from "../layout"

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRES = [
  "Lo-fi", "Hip-Hop", "Electronic", "Ambient", "Rock",
  "Pop", "Jazz", "Folk", "Classical", "Experimental", "Other",
]

const LICENSES = [
  { value: "none",        label: "No license" },
  { value: "cc0",         label: "CC0 — Public Domain" },
  { value: "cc-by",       label: "CC BY" },
  { value: "cc-by-sa",    label: "CC BY-SA" },
  { value: "cc-by-nc",    label: "CC BY-NC" },
  { value: "cc-by-nc-sa", label: "CC BY-NC-SA" },
  { value: "cc-by-nd",    label: "CC BY-ND" },
  { value: "cc-by-nc-nd", label: "CC BY-NC-ND" },
]

// ─── Shared UI ────────────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
    >
      {children}
    </label>
  )
}

function Dropdown({ icon: Icon, value, onChange, options }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2.5 text-sm text-neutral-100 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
    </div>
  )
}

function StatusBanner({ type, messages }) {
  if (!messages?.length) return null
  const isError = type === "error"
  return (
    <div className={clsx(
      "flex items-start gap-3 rounded-lg px-4 py-3.5 mb-6 border",
      isError ? "bg-red-400/10 border-red-400/20" : "bg-green-400/10 border-green-400/20",
    )}>
      {isError
        ? <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        : <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />}
      <ul className={clsx("text-sm space-y-1", isError ? "text-red-300" : "text-green-300")}>
        {messages.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeneralSettingsPage() {
  const { user: owner, slug } = useParams()
  const router = useRouter()
  const { project, setProject } = useSettingsProject()

  const [name,        setName]        = useState(project.name)
  const [description, setDescription] = useState(project.description ?? "")
  const [genre,       setGenre]       = useState(project.genre ?? "")
  const [visibility,  setVisibility]  = useState(project.visibility)
  const [license,     setLicense]     = useState(project.license ?? "none")
  const [saving,      setSaving]      = useState(false)
  const [errors,      setErrors]      = useState([])
  const [success,     setSuccess]     = useState([])

  const descLimit = 350

  const isDirty =
    name.trim()   !== project.name                  ||
    description   !== (project.description ?? "")   ||
    genre         !== (project.genre       ?? "")   ||
    visibility    !== project.visibility             ||
    license       !== (project.license     ?? "none")

  const handleSave = async (e) => {
    e.preventDefault()
    setErrors([])
    setSuccess([])

    if (!name.trim()) {
      setErrors(["Project name is required."])
      return
    }

    setSaving(true)
    try {
      const updated = await api(`/projects/${owner}/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        name.trim(),
          description: description || null,
          genre:       genre       || null,
          visibility,
          license,
        }),
      })

      setSuccess(["Settings saved."])
      setProject(updated)

      // Redirect if slug changed due to rename
      if (updated.slug !== slug) {
        router.replace(`/${updated.ownerUsername}/${updated.slug}/settings/general`)
      }
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-neutral-100">General</h2>
        <p className="mt-1 text-sm text-neutral-500">Basic information about this project.</p>
      </div>

      <StatusBanner type="error"   messages={errors} />
      <StatusBanner type="success" messages={success} />

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <FieldLabel htmlFor="proj-name">
            Project name <span className="text-(--primary-color)">*</span>
          </FieldLabel>
          <input
            id="proj-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
          />
          <p className="mt-1.5 text-xs text-neutral-600">
            Changing the name will also update the project URL.
          </p>
        </div>

        <div>
          <FieldLabel htmlFor="proj-desc">Description</FieldLabel>
          <textarea
            id="proj-desc"
            rows={3}
            maxLength={descLimit}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this project about?"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none resize-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
          />
          <p className="mt-1 text-xs text-neutral-600 text-right">
            {description.length} / {descLimit}
          </p>
        </div>

        <div>
          <FieldLabel>Genre</FieldLabel>
          <Dropdown
            icon={Tag}
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            options={[{ value: "", label: "None" }, ...GENRES.map((g) => ({ value: g, label: g }))]}
          />
        </div>

        <div>
          <FieldLabel>Visibility</FieldLabel>
          <Dropdown
            icon={visibility === "public" ? Globe : Lock}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            options={[
              { value: "public",  label: "Public — anyone can view and clone" },
              { value: "private", label: "Private — only you and collaborators" },
            ]}
          />
        </div>

        <div>
          <FieldLabel>License</FieldLabel>
          <Dropdown
            icon={FileText}
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            options={LICENSES}
          />
        </div>

        <div className="pt-2 flex justify-end border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving || !isDirty || !name.trim()}
            className="flex items-center mt-4 gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2.5 px-5 transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
