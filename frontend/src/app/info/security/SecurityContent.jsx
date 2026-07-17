import { KeyRound, ShieldCheck, Lock, ShieldAlert, Mail } from "lucide-react"

const MEASURES = [
  {
    title: "Password storage",
    body: "Passwords are hashed before they're ever stored — we can't see or recover your actual password, and neither can anyone with access to the database.",
    icon: KeyRound,
  },
  {
    title: "Two-factor authentication",
    body: "Add an authenticator app as a second step at sign-in. Setup gives you a QR code and a set of one-time recovery codes in case you lose access to the app.",
    icon: ShieldCheck,
  },
  {
    title: "Session security",
    body: "Sign-in tokens live in httpOnly cookies, so they can't be read by page scripts. You can see every active session in Settings and revoke any of them — or all of them — instantly.",
    icon: Lock,
  },
  {
    title: "Brute-force protection",
    body: "Repeated failed sign-in attempts are detected and throttled automatically, and logins from unfamiliar locations are flagged for extra scrutiny.",
    icon: ShieldAlert,
  },
]

export default function SecurityContent() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      {/* Hero */}
      <div className="mb-14">
        <div className="flex items-center gap-2 mb-4 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          SECURITY
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          Security
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
          A few of the layers protecting your account. None of these are
          optional on our end — they're on by default for every account.
        </p>
      </div>

      {/* Parallel measures, not a sequence — grid rather than numbered list */}
      <div className="grid gap-3 sm:grid-cols-2">
        {MEASURES.map(({ title, body, icon: Icon }) => (
          <div
            key={title}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-md bg-neutral-800 text-(--primary-color) mb-3">
              <Icon className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-medium text-neutral-100">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
              {body}
            </p>
          </div>
        ))}
      </div>

      {/* Vulnerability reporting */}
      <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-md bg-neutral-800 text-(--primary-color)">
            <Mail className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-medium text-neutral-100">
              Found a vulnerability?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
              Report it to our security contact before disclosing it
              publicly, and we'll acknowledge and follow up as quickly as
              we can.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
