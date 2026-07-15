import Link from "next/link"
import { LogIn, UserPlus, KeyRound, ArrowRight, ShieldCheck } from "lucide-react"

// Simple link-cards used on the /auth landing page.
// Each links to an existing auth route (/auth/login, /auth/signup, ...).
const AUTH_LINKS = [
  {
    href: "/auth/login",
    label: "Log in",
    description: "Access your existing account",
    icon: LogIn,
  },
  {
    href: "/auth/signup",
    label: "Create an account",
    description: "New here? Set up your account",
    icon: UserPlus,
  },
  {
    href: "/auth/forgot-password",
    label: "Forgot password",
    description: "Reset your password by email",
    icon: KeyRound,
  },
  {
    href: "/auth/resend-verification",
    label: "Resend verification",
    description: "Request a new verification email",
    icon: ShieldCheck,
  },
]

export default function AuthLandingContent() {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          {(process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY").toUpperCase()}
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-100">
            Welcome
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Choose how you&apos;d like to continue.
          </p>
        </div>

        <div className="space-y-3">
          {AUTH_LINKS.map(({ href, label, description, icon: Icon }) => (
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
