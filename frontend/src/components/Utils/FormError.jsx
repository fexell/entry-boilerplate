"use client"

import { CircleAlert } from "lucide-react"

const FormError = ({ message }) => {
  if (!message) return null

  return (
    <div className="flex items-start gap-2.5 text-sm text-red-300">
      <CircleAlert className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
      {message}
    </div>
  )
}

export default FormError
