import { Suspense } from "react"

import VerifyEmailForm from "./VerifyEmailForm"

export const metadata = {
  title: "Verify Email | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}