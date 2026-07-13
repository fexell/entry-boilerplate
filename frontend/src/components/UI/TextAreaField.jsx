import { clsx } from "clsx"

export default function TextField({
  id,
  rows,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  autoComplete,
  title,
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
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            autoComplete={autoComplete}
            title={title}
            className={
              clsx(
                "w-full resize-none bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors focus:border-(--primary-color)/60 focus:ring-2 focus:ring-(--primary-color)/10",
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