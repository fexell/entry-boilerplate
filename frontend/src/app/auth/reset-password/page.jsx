import { Suspense } from "react"

import ResetPasswordForm from "./ResetPasswordForm"

export const metadata = {
  title: "Reset Password | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}