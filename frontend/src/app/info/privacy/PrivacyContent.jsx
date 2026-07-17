// Bump this whenever the policy actually changes.
const LAST_UPDATED = "2026-07-17"

const SECTIONS = [
  {
    title: "What we collect",
    body: "Your email address, a hashed version of your password (never the password itself), and basic session data — things like device/browser info and IP address, kept to detect suspicious logins and stop brute-force attempts.",
  },
  {
    title: "Why we collect it",
    body: "Every field above exists to make your account work and keep it secure: signing you in, sending verification and password-reset emails, and recognizing when a login looks risky. Nothing is collected for advertising or sold to third parties.",
  },
  {
    title: "How long we keep it",
    body: "Account data is kept for as long as your account exists. Old security records — expired sessions, stale login-attempt logs — are purged automatically on a rolling schedule rather than kept indefinitely.",
  },
  {
    title: "Your rights",
    body: "You can view and update your account details from Settings at any time. Deleting your account removes your account data permanently — this can't be undone, so we ask you to confirm before it happens.",
  },
  {
    title: "Third parties",
    body: "We use a hosting provider and an email-delivery service to run the product (for things like verification emails). Neither has access to your password, and neither uses your data for anything beyond delivering the service on our behalf.",
  },
]

export default function PrivacyContent() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      {/* Hero */}
      <div className="mb-14">
        <div className="flex items-center gap-2 mb-4 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          LEGAL
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
          A plain-language account of what we collect, why, and what you
          can do about it. See also our{" "}
          <a
            href="/info/cookies"
            className="text-(--primary-color) underline underline-offset-2 hover:no-underline"
          >
            Cookies
          </a>{" "}
          page for cookie-specific details.
        </p>
      </div>

      {/* Numbered sections — order reflects the real structure of the policy */}
      <div className="space-y-3">
        {SECTIONS.map((section, index) => (
          <div
            key={section.title}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5"
          >
            <div className="flex items-start gap-3.5">
              <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-md bg-neutral-800 font-mono text-xs text-(--primary-color)">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-sm font-medium text-neutral-100">
                  {section.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                  {section.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-14 border-t border-neutral-800 pt-8 text-xs text-neutral-600">
        Last updated: {LAST_UPDATED}
      </p>
    </div>
  )
}
