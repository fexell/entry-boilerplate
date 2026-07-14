import { Loader2 } from "lucide-react";

/**
 * Reusable submit button for auth forms.
 * Matches the amber / neutral-950 design system used across Entry.
 *
 * Usage:
 * <SubmitButton isLoading={isSubmitting}>Sign in</SubmitButton>
 */
export default function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = "",
  ...rest
}) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`group w-full flex items-center justify-center gap-2 rounded-md bg-(--primary-color) px-4 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-(--primary-color-hover) disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
        </>
      )}
    </button>
  );
}
