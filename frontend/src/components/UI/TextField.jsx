import { useState } from "react"
import { clsx } from "clsx"
import { Eye, EyeOff } from "lucide-react"

export default function TextField({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  className,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  return (
    <>
      <div className="space-y-2">
        <label
          htmlFor={id}
          className="block font-mono text-[11px] uppercase tracking-wider text-neutral-500"
        >
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          )}

          <input
            id={id}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={
              clsx(
                "w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10",
                Icon && "pl-10",
                className
              )
            }
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </>
  )
}