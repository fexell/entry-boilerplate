

import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function LoginPage() {
  return (
    <>
      <LoginForm />
    </>
  );
}