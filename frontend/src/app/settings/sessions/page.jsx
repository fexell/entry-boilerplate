"use client"

import { useEffect, useState } from "react"
import { Monitor, CircleAlert } from "lucide-react"

import api from "@/lib/api"

const SessionsSettingsPage = () => {
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await api("/account/sessions")
        setSessions(data.sessions ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [])

  const handleRevoke = async (id) => {
    setRevokingId(id)

    try {
      await api(`/account/sessions/${id}`, { method: "DELETE" })
      setSessions((prev) => prev.filter((session) => session.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setRevokingId(null)
    }
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
                    {session.lastActiveAt}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevoke(session.id)}
                  disabled={revokingId === session.id}
                  className="shrink-0 text-sm text-neutral-500 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {revokingId === session.id ? "..." : "Revoke"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SessionsSettingsPage
