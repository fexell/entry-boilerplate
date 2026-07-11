import LoggedOut from "./LoggedOut"

export const metadata = {
  title: "Logged out | " + process.env.NEXT_PUBLIC_APP_NAME,
}

export default function LoggedOutPage() {
  return <LoggedOut />
}
