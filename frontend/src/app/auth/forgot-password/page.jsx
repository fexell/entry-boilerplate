

import ForgotPasswordForm from "./ForgotPasswordForm"

export const metadata = {
  title: "Forgot Password | " + process.env.NEXT_PUBLIC_APP_NAME,
}

const ForgotPasswordPage = () => {
  return (
    <>
      <ForgotPasswordForm />
    </>
  );
}

export default ForgotPasswordPage
