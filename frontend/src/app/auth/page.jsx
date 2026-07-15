

import AuthContent from "./AuthContent"

export const metadata = {
  title: "Authentication | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function AuthPage() {
  return (
    <AuthContent />
  )
}