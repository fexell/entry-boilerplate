"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Trash2, AlertCircle, CircleAlert } from "lucide-react"
import clsx from "clsx"

import api from "@/lib/api"
import { useSettingsProject } from "../layout"

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

function StatusBanner({ messages }) {
  if (!messages?.length) return null
  return (
    <div className="flex items-start gap-3 rounded-lg px-4 py-3.5 mb-4 border bg-red-400/10 border-red-400/20">
      <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
      <ul className="text-sm text-red-300 space-y-1">
        {messages.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  )
}

export default function DangerSettingsPage() {
  const { user: owner, slug } = useParams()
  const router = useRouter()
  const { project } = useSettingsProject()

  const [confirmName, setConfirmName] = useState("")
  const [password,    setPassword]    = useState("")
  const [deleting,    setDeleting]    = useState(false)
  const [errors,      setErrors]      = useState([])

  const canSubmit = confirmName === project.name && password.length > 0

  const handleDelete = async (e) => {
    e.preventDefault()
    setErrors([])

    if (confirmName !== project.name) {
      setErrors(["Project name does not match."])
      return
    }

    setDeleting(true)
    try {
      await api(`/projects/${owner}/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        silent: true,
      })
      router.push(`/${owner}`)
    } catch (err) {
      setErrors(err.errors?.length ? err.errors : [err.message])
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-neutral-100">Delete project</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Once deleted, the project and all its files cannot be recovered.
        </p>
      </div>

      <div className="rounded-lg border border-red-800/40 bg-red-400/5 p-6">
        <div className="flex items-start gap-3 mb-5">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">This action is permanent</p>
            <p className="text-sm text-neutral-500 mt-1">
              All files, versions and settings will be deleted. Confirm by typing the project name and your password.
            </p>
          </div>
        </div>

        <StatusBanner messages={errors} />

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <FieldLabel htmlFor="confirm-name">
              Type{" "}
              <span className="font-mono text-neutral-300 normal-case tracking-normal">
                {project.name}
              </span>{" "}
              to confirm
            </FieldLabel>
            <input
              id="confirm-name"
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={project.name}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
            />
          </div>

          <div>
            <FieldLabel htmlFor="confirm-password">Your password</FieldLabel>
            <input
              id="confirm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={deleting || !canSubmit}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg py-2.5 px-5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : "Delete this project"}
          </button>
        </form>
      </div>
    </div>
  )
}
