import { redirect } from "next/navigation"

export default async function SettingsIndexPage({ params }) {
  const { user, slug } = await params
  redirect(`/${user}/${slug}/settings/general`)
}
