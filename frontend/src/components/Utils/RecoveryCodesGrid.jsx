"use client"

import { useState } from "react"
import { Copy, Download, Check } from "lucide-react"

// Shown after enabling 2FA or regenerating codes - identical UI in both flows.
export default function RecoveryCodesGrid({ codes, onDone, doneLabel = "Done" }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // best-effort, ignore clipboard failures
    }
  }

  const handleDownload = () => {
    const blob = new Blob([codes.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "recovery-codes.txt"
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono text-sm text-neutral-200">
        {codes.map((rc) => (
          <span key={rc}>{rc}</span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy all"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="w-full flex items-center justify-center gap-2 bg-(--primary-color) hover:bg-(--primary-color-hover) text-neutral-950 font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
      >
        {doneLabel}
      </button>
    </div>
  )
}
