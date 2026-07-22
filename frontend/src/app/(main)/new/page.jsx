

import NewProjectContent from "./NewContent";

export const metadata = {
  title: "New Project | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function NewProjectPage() {
  return <NewProjectContent />;
}