"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe, Lock, Tag, FileText, ChevronDown, ArrowRight, CircleAlert } from "lucide-react"

import api from "@/lib/api"

const GENRES = [
  "Lo-fi", "Hip-Hop", "Electronic", "Ambient", "Rock",
  "Pop", "Jazz", "Folk", "Classical", "Experimental", "Other",
]

const LICENSES = [
  { value: "none", label: "No license", blurb: "Default copyright — others need your permission to use it." },
  { value: "cc0", label: "CC0 — Public Domain", blurb: "No rights reserved — anyone can use it for any purpose." },
  { value: "cc-by", label: "CC BY", blurb: "Others can use and remix it, as long as they credit you." },
  { value: "cc-by-sa", label: "CC BY-SA", blurb: "Others can remix it if they credit you and share their version under the same terms." },
  { value: "cc-by-nc", label: "CC BY-NC", blurb: "Others can use and remix it for non-commercial purposes, with credit." },
  { value: "cc-by-nc-sa", label: "CC BY-NC-SA", blurb: "Non-commercial remixing allowed, with credit, shared under the same terms." },
  { value: "cc-by-nd", label: "CC BY-ND", blurb: "Others can share it as-is with credit, but can't remix it." },
  { value: "cc-by-nc-nd", label: "CC BY-NC-ND", blurb: "Others can share it as-is with credit, non-commercially, no remixing." },
]

function SectionHeading({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-xs text-neutral-600">{number}</span>
      <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
      <div className="h-px flex-1 bg-neutral-800" />
    </div>
  )
}

function ConfigRow({ label, description, required, children }) {
  return (
    <div className="flex items-center justify-between gap-6 border border-neutral-800 rounded-lg px-4 py-4">
      <div className="min-w-0">
        <p className="text-sm text-neutral-200 font-medium">
          {label}
          {required && <span className="text-(--primary-color)"> *</span>}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
      </div>
      <div className="shrink-0 w-44">{children}</div>
    </div>
  )
}

function Dropdown({ icon: Icon, value, onChange, options }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
    </div>
  )
}

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [genre, setGenre] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [license, setLicense] = useState("none")
  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeLicense = LICENSES.find((l) => l.value === license)
  const descLimit = 350

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])

    if (!name.trim()) {
      setErrors(["Project name is required."])
      return
    }

    setIsSubmitting(true)
    try {
      const data = await api("/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          genre: genre || null,
          visibility,
          license,
        }),
      })

      router.push(`/${data.ownerUsername}/${data.slug}`)
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-100">Create a new project</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          A project contains your session files and their version history.
        </p>
        <p className="mt-1 text-xs text-neutral-600 italic">Required fields are marked with an asterisk (*).</p>
      </div>

      {errors.length > 0 && (
        <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5 mb-6">
          <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <ul className="text-sm text-red-300 space-y-1">
            {errors.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* General */}
        <div>
          <SectionHeading number="1" title="General" />

          <div className="space-y-5">
            <div>
              <label
                htmlFor="project-name"
                className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
              >
                Project name <span className="text-(--primary-color)">*</span>
              </label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="midnight-drive-sessions"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                maxLength={descLimit}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this project about?"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none resize-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10"
              />
              <p className="mt-1.5 text-xs text-neutral-600 text-right">
                {description.length} / {descLimit} characters
              </p>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div>
          <SectionHeading number="2" title="Configuration" />

          <div className="space-y-3">
            <ConfigRow
              label="Genre"
              description="Help others find your project by category."
            >
              <Dropdown
                icon={Tag}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                options={[{ value: "", label: "None" }, ...GENRES.map((g) => ({ value: g, label: g }))]}
              />
            </ConfigRow>

            <ConfigRow
              label="Choose visibility"
              description={
                visibility === "public"
                  ? "Anyone can view and clone this project."
                  : "Only you and invited collaborators can access it."
              }
              required
            >
              <Dropdown
                icon={visibility === "public" ? Globe : Lock}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" },
                ]}
              />
            </ConfigRow>

            <ConfigRow
              label="Add a license"
              description={activeLicense.blurb}
            >
              <Dropdown
                icon={FileText}
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                options={LICENSES}
              />
            </ConfigRow>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color)/50 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg py-2.5 px-5 transition-colors group"
          >
            {isSubmitting ? "Creating..." : "Create project"}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </form>
    </div>
  )
}
