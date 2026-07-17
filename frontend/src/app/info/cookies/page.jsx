import CookiesContent from "./CookiesContent";

export const metadata = {
  title: "Cookies",
  description: "Which cookies Entry uses, why, and how long they're kept.",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <CookiesContent />
    </main>
  );
}
