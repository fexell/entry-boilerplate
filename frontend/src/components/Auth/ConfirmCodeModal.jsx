"use client"

import { useState } from "react"

import Modal from "../Utils/Modal"
import CodeInputField from "../Utils/CodeInputField"
import FormError from "../Utils/FormError"

// Generic "enter a code, then run some async action" modal.
// This is the piece that lets you bind whatever function you need to the submit button -
// pass it as `onSubmit`. Throw inside it (or let api() throw) to show `err.message` as the error.
//
// Usage:
// <ConfirmCodeModal
//   isOpen={open}
//   onClose={close}
//   icon={ShieldOff}
//   title="Disable two-factor authentication"
//   description="Enter a code from your authenticator app, or a recovery code, to confirm."
//   submitLabel="Disable 2FA"
//   submittingLabel="Disabling..."
//   numericOnly={false}
//   onSubmit={async (code) => { await api("/2fa/disable", {...}); onDisabled() }}
// />
const ConfirmCodeModal = ({
  isOpen,
  onClose,
  icon,
  title,
  description,
  submitLabel,
  submittingLabel = "Submitting...",
  codeMaxLength,
  numericOnly = true,
  requireLength = null, // e.g. 6 to force exact-length codes; null = just "non-empty"
  onSubmit, // async (code) => void - throw to show an error
}) => {
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleClose = () => {
    setCode("")
    setError(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(code)
      setCode("")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = requireLength ? code.length === requireLength : code.length > 0

  return (
    <Modal isOpen={isOpen} onClose={handleClose} icon={icon} title={title} description={description}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <CodeInputField
          value={code}
          onChange={setCode}
          maxLength={codeMaxLength}
          numericOnly={numericOnly}
        />

        <FormError message={error} />

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="flex-1 flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color) disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors px-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ConfirmCodeModal
