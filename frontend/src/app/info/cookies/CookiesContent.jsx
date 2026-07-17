"use client";

import { useState } from "react";

// Each cookie Entry actually sets, described in plain terms.
// Update this list if the auth flow changes which cookies are issued.
const COOKIES = [
  {
    name: "accessToken",
    purpose:
      "Keeps you signed in from page to page. Sent with every request to prove who you are.",
    duration: "Short-lived (minutes) — refreshed automatically in the background",
    httpOnly: true,
  },
  {
    name: "refreshToken",
    purpose:
      "Used to get a new accessToken without you having to sign in again.",
    duration: "Longer-lived (days) or until you sign out",
    httpOnly: true,
  },
  {
    name: "XSRF-TOKEN",
    purpose:
      "Protects your forms and account changes from CSRF attacks (another site acting on your behalf).",
    duration: "Session",
    httpOnly: false,
  },
];

const FAQ = [
  {
    q: "Can I turn these cookies off?",
    a: "Not and stay signed in. accessToken, refreshToken, and XSRF-TOKEN are strictly necessary — without them we can't keep you signed in or protect your account. Blocking them signs you out immediately.",
  },
  {
    q: "Do you set cookies for analytics or advertising?",
    a: `No. ${process.env.NEXT_PUBLIC_APP_NAME ?? "Entry"} doesn't set any cookies for tracking, marketing, or third-party analytics. The list above is complete.`,
  },
  {
    q: "Can JavaScript read my sign-in cookies?",
    a: "No. accessToken and refreshToken are httpOnly, meaning they can never be accessed via JavaScript in the browser — even in the event of a security flaw on the page, they stay protected.",
  },
  {
    q: "How do I clear cookies entirely?",
    a: "Sign out and the session's cookies are cleared by the server. To clear everything manually, use your browser's settings under Privacy / Cookies.",
  },
];

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-neutral-800 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-neutral-200 transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-sm"
      >
        {item.q}
        <ChevronIcon open={isOpen} />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
        }`}
        style={{ display: "grid" }}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-neutral-400">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function CookiesContent() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      {/* Hero */}
      <div className="mb-14">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-400">
          Privacy
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          Cookies
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
          We use a small, exact set of cookies — and every one of them is
          listed here because it keeps the site working and your account
          secure. No tracking or marketing cookies, no third-party tools.
        </p>
      </div>

      {/* Cookie list — treated like session tokens, matching Entry's own vocabulary */}
      <section className="mb-14">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Cookies we use
        </h2>
        <div className="space-y-3">
          {COOKIES.map((cookie) => (
            <div
              key={cookie.name}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <code className="rounded-md bg-neutral-950 px-2 py-1 font-mono text-sm text-amber-400 ring-1 ring-inset ring-neutral-800">
                  {cookie.name}
                </code>
                <span className="inline-flex items-center rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                  Necessary
                </span>
                {cookie.httpOnly && (
                  <span className="inline-flex items-center rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                    httpOnly
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-neutral-400">
                {cookie.purpose}
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                Duration: {cookie.duration}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="mb-14">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Why cookies, and not something else?
        </h2>
        <p className="text-sm leading-relaxed text-neutral-400">
          Signing in relies on your browser being able to prove who you are
          on every request, without you typing your password each time.
          httpOnly cookies are the safest way to do that — they can't be
          read or stolen via JavaScript, which makes them harder to abuse
          than something like localStorage.
        </p>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Frequently asked questions
        </h2>
        <div className="mt-3 border-t border-neutral-800">
          {FAQ.map((item, index) => (
            <FaqItem
              key={item.q}
              item={item}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
            />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="mt-14 border-t border-neutral-800 pt-8 text-xs leading-relaxed text-neutral-600">
        Questions about how we handle cookies or your data? Reach out to
        support and we'll get back to you as soon as we can.
      </p>
    </div>
  );
}
