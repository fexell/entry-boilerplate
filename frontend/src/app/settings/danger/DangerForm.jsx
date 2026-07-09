"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

import api from "@/lib/api";
import useAuthStore from "@/store/useAuthStore";

export default function DangerForm({ username }) {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const expectedText = username ?? "DELETE";
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const confirmPattern = new RegExp(`^${escapeRegExp(expectedText)}$`, "i")
  const isConfirmed = confirmPattern.test(confirmText) && password.length > 0;

  async function handleDelete() {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    setError("");

    try {
      await api("/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      clearUser();
      router.push("/login");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="border border-red-900/40 bg-red-950/10 rounded-lg p-6 space-y-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-mono uppercase tracking-wide text-red-400">
            Danger Zone
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            Deleting your account is permanent and cannot be undone. All data, sessions and settings will be lost.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-wide text-neutral-500">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isDeleting}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 disabled:opacity-50"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-wide text-neutral-500">
          Type <span className="text-neutral-300">{expectedText}</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={isDeleting}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 disabled:opacity-50"
          placeholder={expectedText}
          autoComplete="off"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={!isConfirmed || isDeleting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-mono uppercase tracking-wide bg-red-950/40 border border-red-800/60 text-red-400 hover:bg-red-900/40 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-950/40 transition-colors"
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Delete account...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete account permanently
          </>
        )}
      </button>
    </div>
  );
}
