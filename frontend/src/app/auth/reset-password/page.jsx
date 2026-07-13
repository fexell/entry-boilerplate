import { Suspense } from "react"

import ResetPasswordForm from "./ResetPasswordForm"

import SuspenseFallback from "@/components/UI/SuspenseFallback"

export const metadata = {
  title: "Reset Password | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}