

import SignupForm from "./SignupForm";

export const metadata = {
  title: "Sign Up | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function LoginPage() {
  return (
    <>
      <SignupForm />
    </>
  );
}
