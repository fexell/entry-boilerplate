import { Loader2 } from "lucide-react"

export default function SaveButton({
  children,
  isSubmitting = false,
  disabled = false,
  icon: Icon,
  className = "",
  ...rest
}) {
  return (
    <>
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) disabled:bg-(--primary-color)/50 disabled:cursor-not-allowed text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            {children}
          </>
        )}
      </button>
    </>
  )
}
