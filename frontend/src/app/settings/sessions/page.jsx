

import SessionsForm from "./SessionsForm"

export const metadata = {
  title: "Sessions Settings | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function SessionsSettingsPage() {
  return (
    <SessionsForm />
  )
}