

import ResendVerificationForm from "./ResendVerificationForm"

export const metadata = {
  title: "Resend Verification | " + process.env.NEXT_PUBLIC_APP_NAME,
}

const ResendVerificationPage = () => {
  return (
    <>
      <ResendVerificationForm />
    </>
  );
}

export default ResendVerificationPage
