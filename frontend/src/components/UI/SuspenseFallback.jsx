

import Spinner from "@/components/ui/Spinner";

export default function SuspenseFallback({ fullscreen = false }) {
  return (
    <div
      className={
        fullscreen
          ? "flex min-h-screen items-center justify-center bg-neutral-950"
          : "flex items-center justify-center py-12"
      }
    >
      <Spinner size={fullscreen ? "lg" : "md"} />
    </div>
  );
}