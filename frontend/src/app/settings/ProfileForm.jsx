"use client"

import { useState } from "react"
import { User, Mail, CircleCheck, CircleAlert, Save } from "lucide-react"

import TextField from "@/components/UI/TextField"
import TextAreaField from "@/components/UI/TextAreaField"
import ConfirmPasswordModal from "@/components/Utils/ConfirmPasswordModal"
import SaveButton from '@/components/UI/SaveButton'

import useAuthStore from "@/store/useAuthStore"

import api from "@/lib/api"

const BIO_MAX_LENGTH = 160

export default function ProfileForm() {
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
      <BioSection user={user} />
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

  const initialFirstName = user?.firstName ?? ""
  const initialLastName = user?.lastName ?? ""

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const nameRegex = /^[a-zA-Z]{2,}$/

  const isSubmitDisabled =
    isSubmitting ||
    (formData.firstName === initialFirstName && formData.lastName === initialLastName) ||
    !nameRegex.test(formData.firstName) ||
    !nameRegex.test(formData.lastName)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaved(false)
    setIsSubmitting(true)

    try {
      const response = await api("/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setUser(response.user)
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
          <TextField
            id="firstName"
            label="First name"
            icon={User}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="First name"
            autoComplete="given-name"
          />

          <TextField
            id="lastName"
            label="Last name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <SaveButton isSubmitting={isSubmitting} disabled={isSubmitDisabled}>Save changes</SaveButton>

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
// BIO
// ------------------------------------------------------

const BioSection = () => {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [bio, setBio] = useState(user?.bio ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const remaining = BIO_MAX_LENGTH - bio.length
  const isSubmitDisabled = isSubmitting || bio === (user?.bio ?? "") || remaining < 0

  const handleChange = (e) => {
    setBio(e.target.value)
    setSaved(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaved(false)
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await api("/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      })
      setUser(response.user)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
        Bio
      </h2>

      {error && (
        <div className="flex items-start gap-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3.5 mb-5 max-w-md">
          <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
        <TextAreaField
          id="bio"
          rows={3}
          label="About you"
          maxLength={BIO_MAX_LENGTH}
          value={bio}
          onChange={handleChange}
          placeholder="Tell people a little about yourself"
          title={`Your bio (${bio.length} / ${BIO_MAX_LENGTH})`}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SaveButton isSubmitting={isSubmitting} disabled={isSubmitDisabled}>Save changes</SaveButton>

            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                <CircleCheck className="w-4 h-4 text-(--primary-color)" />
                Saved
              </span>
            )}
          </div>

          <span
            className={`text-xs font-mono ${
              remaining < 0 ? "text-red-400" : "text-neutral-600"
            }`}
          >
            {remaining}
          </span>
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const isSubmitDisabled = !newEmail || newEmail === user?.email

  const handleOpenModal = (e) => {
    e.preventDefault()
    setModalOpen(true)
  }

  const handleConfirm = async (password) => {
    await api("/account/email/change-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, password }),
    })
    setNewEmail("")
  }

  return (
    <section>
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-3">
        Email address
      </h2>

      <p className="text-sm text-neutral-400 mb-4">
        Current: <span className="text-neutral-200">{user?.email}</span>
      </p>

      <form onSubmit={handleOpenModal} className="space-y-5 max-w-md">
        <TextField
          id="newEmail"
          label="New email"
          icon={Mail}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <SaveButton disabled={isSubmitDisabled}>Change email address</SaveButton>
      </form>

      <ConfirmPasswordModal
        open={modalOpen}
        title="Confirm email change"
        description={`Enter your password to confirm changing your email to ${newEmail}.`}
        confirmLabel="Change email"
        confirmingLabel="Changing..."
        successMessage="Check the new address's inbox for a confirmation link. Your current email stays active until you confirm."
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
