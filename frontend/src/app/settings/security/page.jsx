import { Suspense } from "react"

import SecurityForm from "./SecurityForm"

import SuspenseFallback from "@/components/UI/SuspenseFallback"

export const metadata = {
  title: "Security Settings | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function SecuritySettingsPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <SecurityForm />
    </Suspense>
  )
}