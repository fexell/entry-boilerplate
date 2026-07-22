"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"
import {
  Globe, Lock, FileText, Tag, GitBranch,
  Download, Copy, AlertCircle, Clock,
  UploadCloud, FolderOpen, X, File, Folder,
  ImagePlus, Trash2, Loader2,
} from "lucide-react"
import clsx from "clsx"

function SectionHeading({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-xs text-neutral-600">{number}</span>
      <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
      <div className="h-px flex-1 bg-neutral-800" />
    </div>
  )
}

// ─── Cover image ──────────────────────────────────────────────────────────────

function CoverImage({ project, isOwner, onUpdate }) {
  const { user: owner, slug } = useParams()
  const inputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

  const handleFile = useCallback(async (file) => {
    if (!file) return
    setError(null)

    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.")
      return
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be smaller than 2 MB.")
      return
    }

    setSaving(true)
    try {
      // Convert to base64 data URL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const updated = await api(`/projects/${owner}/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: dataUrl }),
      })
      onUpdate(updated)
    } catch (err) {
      setError(err.message ?? "Could not save cover image.")
    } finally {
      setSaving(false)
    }
  }, [owner, slug, onUpdate])

  const handleRemove = async () => {
    setError(null)
    setSaving(true)
    try {
      const updated = await api(`/projects/${owner}/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: "" }),
      })
      onUpdate(updated)
    } catch (err) {
      setError(err.message ?? "Could not remove cover image.")
    } finally {
      setSaving(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const hasCover = !!project.coverImageUrl

  return (
    <div className="space-y-2">
      {/* Image area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={isOwner && !saving ? () => inputRef.current?.click() : undefined}
        className={clsx(
          "relative w-full aspect-square rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 transition-colors",
          isOwner && !saving && "cursor-pointer hover:border-neutral-600 group",
        )}
      >
        {hasCover ? (
          <>
            <img
              src={project.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay for owner */}
            {isOwner && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-xs text-white font-medium flex items-center gap-1.5">
                  <ImagePlus className="w-4 h-4" />
                  Change cover
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-700">
            {saving ? (
              <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
            ) : isOwner ? (
              <>
                <ImagePlus className="w-6 h-6 group-hover:text-neutral-500 transition-colors" />
                <p className="text-xs group-hover:text-neutral-500 transition-colors">Add cover</p>
              </>
            ) : (
              <ImagePlus className="w-6 h-6" />
            )}
          </div>
        )}

        {/* Saving spinner overlay */}
        {saving && hasCover && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Remove button */}
      {hasCover && isOwner && (
        <button
          onClick={handleRemove}
          disabled={saving}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-neutral-600 hover:text-red-400 transition-colors py-1"
        >
          <Trash2 className="w-3 h-3" />
          Remove cover
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

// Recursively collect all File entries from a DataTransferItemList,
// preserving folder structure as { file: File, path: string }[].
async function collectEntries(items) {
  const results = []

  async function traverse(entry, basePath = "") {
    if (entry.isFile) {
      await new Promise((resolve) => {
        entry.file((f) => {
          results.push({ file: f, path: basePath + f.name })
          resolve()
        })
      })
    } else if (entry.isDirectory) {
      const reader = entry.createReader()
      await new Promise((resolve) => {
        reader.readEntries(async (entries) => {
          for (const child of entries) {
            await traverse(child, basePath + entry.name + "/")
          }
          resolve()
        })
      })
    }
  }

  for (const item of Array.from(items)) {
    const entry = item.webkitGetAsEntry?.()
    if (entry) await traverse(entry)
  }

  return results
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function DropZone({ onFiles }) {
  const [isDragging, setIsDragging] = useState(false)
  const [stagedFiles, setStagedFiles] = useState([]) // [{ file, path }]
  const inputRef = useRef(null)
  const dragCounterRef = useRef(0)

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounterRef.current++
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)

    const entries = await collectEntries(e.dataTransfer.items)
    if (entries.length > 0) setStagedFiles((prev) => [...prev, ...entries])
  }, [])

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files ?? [])
    const entries = files.map((f) => ({ file: f, path: f.webkitRelativePath || f.name }))
    if (entries.length > 0) setStagedFiles((prev) => [...prev, ...entries])
    // reset so the same files can be re-selected
    e.target.value = ""
  }

  const removeFile = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => setStagedFiles([])

  const totalSize = stagedFiles.reduce((acc, { file }) => acc + file.size, 0)

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors duration-150 cursor-pointer",
          isDragging
            ? "border-(--primary-color)/60 bg-(--primary-color)/5"
            : "border-neutral-800 hover:border-neutral-700 hover:bg-white/[0.01]",
        )}
        onClick={() => inputRef.current?.click()}
      >
        <div className={clsx(
          "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
          isDragging ? "bg-(--primary-color)/10" : "bg-neutral-800",
        )}>
          <UploadCloud className={clsx(
            "w-6 h-6 transition-colors",
            isDragging ? "text-(--primary-color)" : "text-neutral-500",
          )} />
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-300">
            {isDragging ? "Drop to add files" : "Drag & drop files or folders"}
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Supports files, folders and .zip archives
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
            className="text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-700 hover:border-neutral-600 rounded-md px-3 py-1.5 transition-colors"
          >
            Browse files
          </button>
          <label
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-700 hover:border-neutral-600 rounded-md px-3 py-1.5 transition-colors cursor-pointer"
          >
            Browse folder
            <input
              type="file"
              // @ts-ignore — non-standard but widely supported
              webkitdirectory="true"
              multiple
              className="sr-only"
              onChange={handleInputChange}
            />
          </label>
        </div>

        {/* Hidden file input for "Browse files" */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="*"
          className="sr-only"
          onChange={handleInputChange}
        />
      </div>

      {/* Staged file list */}
      {stagedFiles.length > 0 && (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/50">
            <span className="text-xs text-neutral-400">
              {stagedFiles.length} file{stagedFiles.length !== 1 ? "s" : ""} staged
              <span className="ml-2 text-neutral-600">({formatBytes(totalSize)})</span>
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Clear all
            </button>
          </div>

          <ul className="max-h-52 overflow-y-auto divide-y divide-neutral-800/60">
            {stagedFiles.map(({ file, path }, i) => {
              const isZip = file.name.endsWith(".zip")
              const hasFolder = path.includes("/")
              const Icon = hasFolder ? Folder : (isZip ? FileText : File)

              return (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5 group">
                  <Icon className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span className="flex-1 min-w-0 text-xs text-neutral-400 truncate" title={path}>
                    {path}
                  </span>
                  <span className="text-[11px] text-neutral-600 shrink-0">{formatBytes(file.size)}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="shrink-0 text-neutral-700 hover:text-neutral-400 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="px-4 py-3 border-t border-neutral-800 flex justify-end">
            <button
              onClick={() => onFiles?.(stagedFiles)}
              className="flex items-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2 px-4 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Upload {stagedFiles.length} file{stagedFiles.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectContent() {
  const { user, slug } = useParams()
  const { user: authUser } = useAuthStore()

  const [project, setProject] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await api(`/projects/${user}/${slug}`, {
          method: "GET",
          silent: true,
        })

        if (active) {
          setProject(data)
          setVersions(data.versions || [])
          setLoading(false)
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load project.")
          setLoading(false)
        }
      }
    }

    load()
    return () => { active = false }
  }, [user, slug])

  if (loading) {
    return (
      <div className="px-4 py-20 text-center text-neutral-500 text-sm">
        Loading project…
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="px-4 py-20 text-center">
        <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-3" />
        <h1 className="text-base font-semibold text-neutral-200">Project not found</h1>
        <p className="text-neutral-500 text-sm mt-1.5">
          {error || "The project you're looking for doesn't exist."}
        </p>
      </div>
    )
  }

  const VisibilityIcon = project.visibility === "public" ? Globe : Lock
  const isOwner = authUser?.username === project.ownerUsername
  const hasFiles = versions.length > 0

  const handleUpload = (stagedFiles) => {
    // TODO: wire up to upload endpoint
    console.log("Upload triggered with", stagedFiles)
  }

  return (
    <div className="flex-1 w-full px-4 py-12">

      {/* Page header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-neutral-500 mb-1">
          {project.ownerUsername}
        </p>
        <h1 className="text-2xl font-semibold text-neutral-100">{project.name}</h1>
        {project.description && (
          <p className="mt-2 text-sm text-neutral-500 max-w-2xl">
            {project.description}
          </p>
        )}
      </div>

      {/* Two-column layout: main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start">

        {/* ── Main column ── */}
        <div className="space-y-10 min-w-0">

          {/* Actions — only when there are files */}
          {hasFiles && (
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2.5 px-5 transition-colors">
                <Copy className="w-4 h-4" />
                Clone project
              </button>
              <button className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-medium text-sm rounded-lg py-2.5 px-5 transition-colors">
                <Download className="w-4 h-4" />
                Download latest
              </button>
            </div>
          )}

          {/* Files / upload area */}
          <div>
            <SectionHeading number="1" title="Files" />

            {!hasFiles && isOwner ? (
              <DropZone onFiles={handleUpload} />
            ) : !hasFiles ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-800 py-12 text-center">
                <FolderOpen className="w-7 h-7 text-neutral-700" />
                <p className="text-sm text-neutral-500">No files uploaded yet.</p>
              </div>
            ) : (
              // TODO: render file browser once files exist
              <p className="text-sm text-neutral-500">File browser coming soon.</p>
            )}
          </div>

          {/* Version history */}
          {hasFiles && (
            <div>
              <SectionHeading number="2" title="Version history" />
              <div className="space-y-3">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-4 border border-neutral-800 rounded-lg px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-200 font-medium">{v.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <p className="text-xs text-neutral-500">
                          {new Date(v.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 shrink-0 transition-colors">
                      <GitBranch className="w-4 h-4" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-4 lg:sticky lg:top-6">

          {/* Cover image */}
          <CoverImage
            project={project}
            isOwner={isOwner}
            onUpdate={setProject}
          />

          {/* Divider */}
          <div className="h-px bg-neutral-800" />

          {/* Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-3">
              Details
            </h3>
            <div className="space-y-2">

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Visibility</span>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <VisibilityIcon className="w-3.5 h-3.5 text-neutral-600" />
                  {project.visibility === "public" ? "Public" : "Private"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">License</span>
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <FileText className="w-3.5 h-3.5 text-neutral-600" />
                  {project.license || "None"}
                </span>
              </div>

              {project.genre && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Genre</span>
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Tag className="w-3.5 h-3.5 text-neutral-600" />
                    {project.genre}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-800" />

          {/* Actions in sidebar when no files yet */}
          {!hasFiles && isOwner && (
            <>
              <p className="text-xs text-neutral-600">
                Upload your first files to enable cloning and downloads.
              </p>
              <div className="h-px bg-neutral-800" />
            </>
          )}

          {hasFiles && (
            <div className="space-y-2">
              <button className="flex w-full items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg py-2 px-3 transition-colors">
                <Copy className="w-3.5 h-3.5" />
                Clone project
              </button>
              <button className="flex w-full items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-medium text-sm rounded-lg py-2 px-3 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Download latest
              </button>
            </div>
          )}

        </aside>
      </div>
    </div>
  )
}
