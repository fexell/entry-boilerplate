// Bump this whenever the terms actually change.
const LAST_UPDATED = "2026-07-17"

const SECTIONS = [
  {
    title: "Accounts",
    body: "You're responsible for the activity that happens under your account, and for keeping your credentials to yourself. Let us know right away if you think someone else has access to it — you can revoke sessions individually or all at once from Settings.",
  },
  {
    title: "Acceptable use",
    body: "Use the service the way it's meant to be used: don't try to break authentication, access accounts that aren't yours, or interfere with other users. Automated abuse, including brute-forcing logins, is not allowed and is actively monitored.",
  },
  {
    title: "Your content and data",
    body: "You keep ownership of whatever you store through your account. We don't claim rights over it beyond what's needed to run the service — store it, back it up, and serve it back to you.",
  },
  {
    title: "Termination",
    body: "You can delete your account at any time from Settings; this permanently removes your account data. We may suspend or terminate accounts that violate these terms, with notice where practical.",
  },
  {
    title: "Liability",
    body: "The service is provided as-is. We work to keep it available and secure, but we can't guarantee uninterrupted access, and we're not liable for indirect or consequential damages arising from its use.",
  },
  {
    title: "Changes to these terms",
    body: "If these terms change in a material way, we'll update the date below and make a reasonable effort to let active users know. Continuing to use the service after a change means you accept the update.",
  },
]

export default function TermsContent() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      {/* Hero */}
      <div className="mb-14">
        <div className="flex items-center gap-2 mb-4 font-mono text-xs tracking-widest text-neutral-500">
          <span className="inline-block w-1.5 h-1.5 bg-(--primary-color) rounded-full animate-pulse" />
          LEGAL
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
          The basics of using this service — kept short on purpose. If
          anything here is unclear, reach out and we'll walk through it.
        </p>
      </div>

      {/* Numbered sections — order reflects the real structure of the terms */}
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
