

import ResendVerificationForm from "./ResendVerificationForm"

export const metadata = {
  title: "Resend Verification | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function ResendVerificationPage() {
  return (
    <>
      <ResendVerificationForm />
    </>
  );
}
