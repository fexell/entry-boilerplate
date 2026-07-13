import { Suspense } from "react"

import VerifyEmailForm from "./VerifyEmailForm"

import SuspenseFallback from "@/components/UI/SuspenseFallback"

export const metadata = {
  title: "Verify Email | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <VerifyEmailForm />
    </Suspense>
  )
}