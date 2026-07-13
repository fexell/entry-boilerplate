"use client"

import DangerForm from "./DangerForm"

import useAuthStore from "@/store/useAuthStore"

export default function AccountSettingsPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-100">Danger Zone</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Here you can delete your account.
        </p>
      </div>

      <DangerForm username={user?.username} />
    </div>
  )
}
