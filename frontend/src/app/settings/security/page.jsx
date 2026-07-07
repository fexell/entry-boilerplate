import { Suspense } from "react"

import SecurityForm from "./SecurityForm"

export const metadata = {
  title: "Security Settings | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function SecuritySettingsPage() {
  return (
    <Suspense fallback={null}>
      <SecurityForm />
    </Suspense>
  )
}