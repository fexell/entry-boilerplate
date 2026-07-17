import Link from "next/link"
import { Cookie, FileText, Lock, ShieldCheck, ArrowRight } from "lucide-react"

// Link-cards for pages under /info. Add new entries here as more
// info pages are built.
const INFO_LINKS = [
  {
    href: "/info/terms",
    label: "Terms of Service",
    description: "The terms that apply when you use this service",
    icon: FileText,
  },
  {
    href: "/info/privacy",
    label: "Privacy Policy",
    description: "What we collect, why, and how it's used",
    icon: Lock,
  },
  {
    href: "/info/security",
    label: "Security",
    description: "How your account and data are protected",
    icon: ShieldCheck,
  },
  {
    href: "/info/cookies",
    label: "Cookies",
    description: "What cookies we set, and why",
    icon: Cookie,
  },
]

export default function InfoContent() {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          INFO
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-100">
            Info
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Policies and other details about how this works.
          </p>
        </div>

        <div className="space-y-3">
          {INFO_LINKS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3.5 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3.5 transition-colors hover:border-(--primary-color)/60 hover:bg-neutral-900/80"
            >
              <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-md bg-neutral-800 text-neutral-400 transition-colors group-hover:bg-(--primary-color)/10 group-hover:text-(--primary-color)">
                <Icon className="w-4 h-4" />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-neutral-100">
                  {label}
                </span>
                <span className="block text-xs text-neutral-500 truncate">
                  {description}
                </span>
              </span>

              <ArrowRight className="w-4 h-4 text-neutral-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-(--primary-color)" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
