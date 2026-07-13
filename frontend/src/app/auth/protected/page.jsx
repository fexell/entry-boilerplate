

import { Suspense } from "react"

import Protected from "./Protected"

import SuspenseFallback from "@/components/UI/SuspenseFallback"

export const metadata = {
  title: "Protected | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Protected />
    </Suspense>
  )
}
