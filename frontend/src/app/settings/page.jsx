"use client"

import { useState } from "react"
import { User, Mail, CircleCheck } from "lucide-react"

import api from "@/lib/api"
import useAuthStore from "@/store/useAuthStore"

const ProfileSettingsPage = () => {
  const user = useAuthStore((state) => state.user)

  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaved(false)
    setIsSubmitting(true)

    try {
      await api("/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setSaved(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-100">Profile</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Update your name and the email address linked to your account.
        </p>
      </div>

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

        <div>
          <label
            htmlFor="email"
            className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-600">
            Changing your email will require you to verify the new address.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/40 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-500">
              <CircleCheck className="w-4 h-4 text-amber-400" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProfileSettingsPage
