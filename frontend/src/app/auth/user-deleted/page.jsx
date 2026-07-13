

import UserDeleted from "./UserDeleted";

export const metadata = {
  title: "User Deleted | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function UserDeletedPage() {
  return <UserDeleted />;
}
