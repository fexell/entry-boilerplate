import { Suspense } from "react"

import ProfileForm from "./ProfileForm"

import SuspenseFallback from "@/components/UI/SuspenseFallback"

export const metadata = {
  title: "Profile Settings | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ProfileForm />
    </Suspense>
  )
}