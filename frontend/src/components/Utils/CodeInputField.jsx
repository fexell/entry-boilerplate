"use client"

import { KeyRound } from "lucide-react"

export default function CodeInputField ({
  id = "verificationCode",
  label = "Verification code",
  value,
  onChange,
  maxLength,
  placeholder = "123456",
  numericOnly = true,
  autoFocus = true,
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
        {label}
      </label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <input
          id={id}
          type="text"
          inputMode={numericOnly ? "numeric" : "text"}
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          {...(maxLength ? { maxLength } : {})}
          placeholder={placeholder}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10"
          value={value}
          onChange={(e) => onChange(numericOnly ? e.target.value.replace(/\D/g, "") : e.target.value)}
        />
      </div>
    </div>
  )
}
