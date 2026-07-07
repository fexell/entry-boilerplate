import { Suspense } from "react"

import ProfileForm from "./ProfileForm"

export const metadata = {
  title: "Profile Settings | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <ProfileForm />
    </Suspense>
  )
}