

import { Suspense } from "react";

import Protected from "./Protected";

export const metadata = {
  title: "Protected | " + (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={null}>
      <Protected />
    </Suspense>
  );
}
