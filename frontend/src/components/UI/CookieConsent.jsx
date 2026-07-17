"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-notice-seen";

/**
 * Cookie notice.
 * Purely informational — lets visitors know cookies are used, no accept/decline choice.
 * Dismissing it just hides the banner and remembers that in localStorage.
 * Drop this into your root layout (e.g. app/layout.jsx) so it renders on every page.
 */
export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Small delay so the banner doesn't fight with the page's own load-in.
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cookie-meddelande"
      className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 motion-reduce:animate-none"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 border border-neutral-800 bg-neutral-950/95 p-5 shadow-2xl backdrop-blur sm:m-4 sm:flex-row sm:items-center sm:justify-between sm:rounded-xl">
        <p className="text-sm leading-relaxed text-neutral-300">
          This site uses cookies to function and to understand how it is used.{" "}
          <a
            href="/info/cookies"
            className="font-medium text-(--primary-color) underline underline-offset-2 hover:text-(--primary-color-hover)"
          >
            Read more
          </a>
          .
        </p>

        <div className="shrink-0">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg bg-(--primary-color)/90 px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-(--primary-color-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
