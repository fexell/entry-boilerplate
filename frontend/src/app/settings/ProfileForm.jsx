"use client"

import { useState } from "react"
import { User, Mail, Lock, CircleCheck, CircleAlert } from "lucide-react"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

const ProfileForm = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-100">Profile</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Update your name and the email address linked to your account.
        </p>
      </div>

      <NameSection user={user} />
      <EmailSection user={user} />
    </div>
  )
}

// ------------------------------------------------------
// NAME
// ------------------------------------------------------

const NameSection = () => {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const isSubmitDisabled =
    isSubmitting ||
    (formData.firstName === user?.firstName && formData.lastName === user?.lastName)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaved(false)
    setIsSubmitting(true)

    try {
      const me = await api("/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setUser(me)
      setSaved(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
        Name
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              First name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last name"
              autoComplete="family-name"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color-disabled) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-500">
              <CircleCheck className="w-4 h-4 text-(--primary-color)" />
              Saved
            </span>
          )}
        </div>
      </form>
    </section>
  )
}

// ------------------------------------------------------
// EMAIL
// ------------------------------------------------------

const EmailSection = () => {
  const user = useAuthStore((state) => state.user)

  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const isSubmitDisabled =
    isSubmitting || !newEmail || !password || newEmail === user?.email

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(false)
    setError(null)
    setIsSubmitting(true)

    try {
      await api("/account/email/change-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password }),
      })
      setSuccess(true)
      setNewEmail("")
      setPassword("")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
        Email address
      </h2>

      <p className="text-sm text-neutral-400 mb-4">
        Current: <span className="text-neutral-200">{user?.email}</span>
      </p>

      {success && (
        <div className="flex items-start gap-3 bg-(--primary-color-10) border border-(--primary-color-20) rounded-lg px-4 py-3.5 mb-5 max-w-md">
          <CircleCheck className="w-4 h-4 text-(--primary-color) mt-0.5 shrink-0" />
          <p className="text-sm text-amber-300">
            Check the new address&apos;s inbox for a confirmation link. Your current email stays active until you confirm.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5 mb-5 max-w-md">
          <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div>
          <label
            htmlFor="newEmail"
            className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
          >
            New email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input
              id="newEmail"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="emailChangePassword"
            className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input
              id="emailChangePassword"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color-disabled) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
        >
          {isSubmitting ? "Sending..." : "Change email address"}
        </button>
      </form>
    </section>
  )
}

export default ProfileForm
