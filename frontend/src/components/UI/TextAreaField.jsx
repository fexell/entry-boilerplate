import { clsx } from "clsx"

export default function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  className,
  ...props
}) {
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
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={
              clsx(
                "w-full resize-none bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-amber-400/10",
                Icon && "pl-10",
                className
              )
            }
            {...props}
          />
        </div>
      </div>
    </>
  )
}