"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useId,
} from "react"
import Link from "next/link"
import clsx from "clsx"

// ---------------------------------------------------------------------------
// Context: shares open/close state + positioning between Trigger and Menu
// ---------------------------------------------------------------------------
const DropdownContext = createContext(null)

function useDropdownContext() {
  const ctx = useContext(DropdownContext)
  if (!ctx) {
    throw new Error("Dropdown.* components must be used inside <Dropdown>")
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Root component — holds state, click-outside handling, escape-to-close
// ---------------------------------------------------------------------------
export function Dropdown({ children, align = "left", className }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)
  const id = useId()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  // Close on escape
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open])

  useEffect(() => {
    if (!open) setActiveIndex(-1)
  }, [open])

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, align, id, activeIndex, setActiveIndex }}
    >
      <div ref={rootRef} className={clsx("relative inline-block", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Trigger — wraps whatever element opens the menu (button, avatar, icon...)
// ---------------------------------------------------------------------------
Dropdown.Trigger = function Trigger({ children, className, asChild = false }) {
  const { open, setOpen, id } = useDropdownContext()

  const props = {
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": id,
    onClick: () => setOpen((prev) => !prev),
  }

  // asChild lets you pass your own element (e.g. an <img> avatar) and still
  // get the right handlers/aria attributes on it directly.
  if (asChild && children?.props) {
    const child = children
    return {
      ...child,
      props: { ...child.props, ...props },
    }
  }

  return (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Menu — the floating panel. Positions itself under the trigger.
// ---------------------------------------------------------------------------
Dropdown.Menu = function Menu({ children, className }) {
  const { open, align, id, setOpen, activeIndex, setActiveIndex } =
    useDropdownContext()
  const menuRef = useRef(null)

  const itemRefs = useRef([])
  itemRefs.current = []

  function registerItem(el) {
    if (el) itemRefs.current.push(el)
  }

  function handleKeyDown(e) {
    const count = itemRefs.current.length
    if (!count) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % count)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + count) % count)
    } else if (e.key === "Enter" && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.click()
    }
  }

  useEffect(() => {
    if (activeIndex >= 0) itemRefs.current[activeIndex]?.focus()
  }, [activeIndex])

  if (!open) return null

  return (
    <div
      id={id}
      ref={menuRef}
      role="menu"
      onKeyDown={handleKeyDown}
      className={clsx(
        "absolute z-50 mt-2 min-w-55 rounded-lg border border-neutral-800",
        "bg-neutral-900 py-1 shadow-2xl",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      <ItemRegistrar.Provider value={registerItem}>
        {children}
      </ItemRegistrar.Provider>
    </div>
  )
}

const ItemRegistrar = createContext(() => {})

// ---------------------------------------------------------------------------
// Item — a single clickable row (link or action button)
// ---------------------------------------------------------------------------
Dropdown.Item = function Item({
  href,
  onClick,
  icon,
  trailing, // e.g. a small badge like "Free"
  danger = false,
  children,
}) {
  const { setOpen } = useDropdownContext()
  const register = useContext(ItemRegistrar)
  const ref = useRef(null)

  useEffect(() => {
    register(ref.current)
  })

  const content = (
    <span className="flex w-full items-center gap-2 px-3 py-2 text-sm">
      {icon && <span className="flex h-4 w-4 shrink-0 items-center">{icon}</span>}
      <span className="flex-1 truncate text-left">{children}</span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </span>
  )

  const sharedClassName = clsx(
    "block w-full rounded-md outline-none transition-colors",
    "hover:bg-neutral-800 focus:bg-neutral-800",
    danger ? "text-red-400 hover:text-red-300" : "text-neutral-200"
  )

  function handleClick(e) {
    onClick?.(e)
    setOpen(false)
  }

  if (href) {
    return (
      <Link
        ref={ref}
        href={href}
        role="menuitem"
        className={sharedClassName}
        onClick={handleClick}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      className={sharedClassName}
      onClick={handleClick}
    >
      {content}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Divider — thin separator between groups of items
// ---------------------------------------------------------------------------
Dropdown.Divider = function Divider() {
  return <div className="my-1 border-t border-neutral-800" />
}

export default Dropdown
