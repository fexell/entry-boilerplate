import { Suspense } from "react"

import SessionsForm from "./SessionsForm"

import SuspenseFallback from "@/components/UI/SuspenseFallback"

export const metadata = {
  title: "Sessions Settings | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function SessionsSettingsPage() {
  return (
    <>
      <Suspense fallback={<SuspenseFallback />}>
        <SessionsForm />
      </Suspense>
    </>
  )
}