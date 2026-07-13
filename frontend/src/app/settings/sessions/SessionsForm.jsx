"use client"

import { useEffect, useState } from "react"
import { Monitor, CircleAlert } from "lucide-react"

import RevokeAllSessionsButton from "@/components/Settings/RevokeAllSessionsButton"
import ConfirmPasswordModal from "@/components/Utils/ConfirmPasswordModal"

import api from "@/lib/api"

const formatRelativeTime = (isoString) => {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if(diffSec < 60) return "Right now"
  if(diffMin < 60) return `${diffMin} min ago`
  if(diffHour < 24) return `${diffHour} hours ago`
  if(diffDay === 1) return "Yesterday"
  if(diffDay < 7) return `${diffDay} days ago`

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

export default function SessionsForm() {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionToRevoke, setSessionToRevoke] = useState(null) // session object | null

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await api("/account/sessions")
        setSessions(data ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [])

  const handleRevoke = async (password) => {
    await api(`/account/sessions/${sessionToRevoke.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    setSessions((prev) => prev.filter((session) => session.id !== sessionToRevoke.id))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-100">Sessions</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Devices currently signed in to your account.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5 mb-5 max-w-md">
          <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-neutral-500">No other active sessions.</p>
      ) : (
        <ul className="space-y-2 max-w-md">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-start justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3.5"
            >
              <div className="flex items-start gap-3">
                <Monitor className="w-4 h-4 mt-0.5 shrink-0 text-neutral-600" />
                <div>
                  <p className="text-sm text-neutral-200">
                    {session.device ?? "Unknown device"}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs text-amber-400">This device</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {session.location ?? "Unknown location"} · Last active{" "}
                    {formatRelativeTime(session.lastActiveAt)}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() => setSessionToRevoke(session)}
                  className="shrink-0 text-sm text-neutral-500 hover:text-red-300 transition-colors"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 pt-6 border-t border-neutral-800">
        <h2 className="text-sm font-medium text-neutral-300">Revoke all sessions</h2>
        <p className="mt-1 text-sm text-neutral-500 max-w-md">
          Log out of all sessions except this one. Useful if you suspect unauthorized access to your account.
        </p>
        <div className="mt-4">
          <RevokeAllSessionsButton />
        </div>
      </div>

      <ConfirmPasswordModal
        open={!!sessionToRevoke}
        onClose={() => setSessionToRevoke(null)}
        onConfirm={handleRevoke}
        title="Revoke session"
        description={`This will log out "${sessionToRevoke?.device ?? "this device"}". Please enter your password to confirm.`}
        confirmLabel="Revoke session"
        confirmingLabel="Revoking..."
        successMessage="The session has been logged out."
      />
    </div>
  )
}
