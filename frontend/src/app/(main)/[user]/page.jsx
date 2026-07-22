import ProfileContent from "./ProfileContent"

export async function generateMetadata({ params }) {
  const { user } = await params

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/${user}`,
      { cache: "no-store" }
    )
    if (!res.ok) return {}
    const profile = await res.json()

    const displayName =
      [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username

    return { title: `${displayName} – Audwio` }
  } catch {
    return {}
  }
}

export default function ProfilePage() {
  return <ProfileContent />
}
