"use client"

import { X } from "lucide-react"

// Reusable modal shell: overlay + card + optional icon/title/description header.
// Handles only presentation - content and submit logic live in whatever you pass as children.
//
// Usage:
// <Modal isOpen={open} onClose={close} icon={ShieldOff} title="..." description="...">
//   <form>...</form>
// </Modal>
export default function Modal({
  isOpen,
  onClose,
  icon: Icon,
  title,
  description,
  children,
  maxWidth = "max-w-sm",
  showCloseButton = true,
  // "compact": p-6 card, icon+title inline, close button absolute top-right (Disable/Regenerate style)
  // "sectioned": header row with border-b and its own close button, separate padded body (Setup style)
  variant = "compact",
}) {
  if (!isOpen) return null

  if (variant === "sectioned") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className={`w-full ${maxWidth} bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-200">{title}</h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-600 hover:text-neutral-300 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className={`relative w-full ${maxWidth} bg-neutral-950 border border-neutral-800 rounded-xl p-6`}>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-neutral-600 hover:text-neutral-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {(Icon || title) && (
          <div className="flex items-center gap-2.5 mb-1.5">
            {Icon && <Icon className="w-4 h-4 text-(--primary-color)" />}
            {title && <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>}
          </div>
        )}

        {description && <p className="text-xs text-neutral-500 mb-5">{description}</p>}

        {children}
      </div>
    </div>
  )
}
